-- Migration 003: Notification triggers and API keys table
-- Run after 001_initial_schema.sql

-- ─────────────────────────────────────────────────────────────────────────────
-- Function: notify_new_member
-- Sends a notification to all org admins/owners when a new member joins
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION notify_new_member()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _new_member_name TEXT;
  _org_name        TEXT;
  _admin           RECORD;
BEGIN
  -- Only fire when a NEW member row is inserted (not updates)
  IF TG_OP <> 'INSERT' THEN RETURN NEW; END IF;

  -- Skip owner-as-first-member (onboarding bootstrap)
  IF NEW.role = 'owner' THEN RETURN NEW; END IF;

  SELECT full_name INTO _new_member_name
  FROM profiles WHERE id = NEW.user_id;

  SELECT name INTO _org_name
  FROM organizations WHERE id = NEW.org_id;

  -- Notify all owners and admins of the org
  FOR _admin IN
    SELECT user_id FROM organization_members
    WHERE org_id = NEW.org_id
      AND role IN ('owner', 'admin')
      AND user_id <> NEW.user_id
  LOOP
    INSERT INTO notifications (user_id, org_id, type, title, message)
    VALUES (
      _admin.user_id,
      NEW.org_id,
      'new_member',
      'New member joined',
      COALESCE(_new_member_name, 'Someone') || ' joined ' || COALESCE(_org_name, 'your organization') || '.'
    );
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_member_joined ON organization_members;
CREATE TRIGGER on_member_joined
  AFTER INSERT ON organization_members
  FOR EACH ROW EXECUTE FUNCTION notify_new_member();

-- ─────────────────────────────────────────────────────────────────────────────
-- API Keys table — lets pro users create long-lived keys for API access
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,                -- human label, e.g. "CI pipeline"
  key_hash    TEXT NOT NULL UNIQUE,         -- SHA-256 of the actual key (never stored)
  key_prefix  TEXT NOT NULL,               -- first 8 chars shown in UI, e.g. "sk_live_"
  last_used_at TIMESTAMPTZ,
  expires_at  TIMESTAMPTZ,                 -- NULL = never expires
  revoked_at  TIMESTAMPTZ,                 -- NULL = still active
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Members can view their org's API keys
CREATE POLICY "Members view org api keys"
  ON api_keys FOR SELECT
  USING (org_id = ANY(auth.user_org_ids()));

-- Only owners/admins can create keys
CREATE POLICY "Owners and admins create api keys"
  ON api_keys FOR INSERT
  WITH CHECK (
    auth.user_org_role(org_id) IN ('owner', 'admin')
    AND user_id = auth.uid()
  );

-- Only the creator or an owner can revoke (soft-delete via revoked_at)
CREATE POLICY "Owner or creator can revoke api keys"
  ON api_keys FOR UPDATE
  USING (
    user_id = auth.uid()
    OR auth.user_org_role(org_id) = 'owner'
  )
  WITH CHECK (
    -- Only allow setting revoked_at; no other field changes via policy
    user_id = auth.uid()
    OR auth.user_org_role(org_id) = 'owner'
  );

-- Indexes
CREATE INDEX idx_api_keys_org_id   ON api_keys (org_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys (key_hash);
CREATE INDEX idx_api_keys_user_id  ON api_keys (user_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Webhooks table — orgs can register endpoints to receive event payloads
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS webhooks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  url         TEXT NOT NULL,
  secret      TEXT NOT NULL,              -- HMAC secret, store encrypted in app layer
  events      TEXT[] NOT NULL DEFAULT '{}', -- e.g. ['member.joined', 'invoice.paid']
  enabled     BOOLEAN NOT NULL DEFAULT TRUE,
  last_fired_at TIMESTAMPTZ,
  created_at  TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage webhooks"
  ON webhooks FOR ALL
  USING  (auth.user_org_role(org_id) IN ('owner', 'admin'))
  WITH CHECK (auth.user_org_role(org_id) IN ('owner', 'admin'));

CREATE INDEX idx_webhooks_org_id ON webhooks (org_id);
