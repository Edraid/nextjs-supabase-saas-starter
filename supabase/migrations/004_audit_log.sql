-- Migration 004: Audit log
-- Tracks all significant actions in the app for compliance and debugging.
-- Append-only: no UPDATE or DELETE policies — audit records are permanent.

CREATE TABLE IF NOT EXISTS audit_logs (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id        UUID REFERENCES organizations(id) ON DELETE SET NULL,
  user_id       UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action        TEXT NOT NULL,        -- e.g. 'member.invited', 'subscription.upgraded'
  resource_type TEXT NOT NULL,        -- e.g. 'invitation', 'subscription', 'api_key'
  resource_id   TEXT,                 -- UUID or identifier of the affected resource
  metadata      JSONB DEFAULT '{}',   -- extra context (old/new values, IP, etc.)
  ip_address    INET,
  user_agent    TEXT,
  created_at    TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Owners and admins can view their org's audit log
CREATE POLICY "Admins can view audit logs"
  ON audit_logs FOR SELECT
  USING (
    org_id IS NOT NULL
    AND auth.user_org_role(org_id) IN ('owner', 'admin')
  );

-- Only the service role (admin client) can insert — never the user directly
-- No INSERT policy for authenticated role = service role only

-- No UPDATE or DELETE policies = append-only

CREATE INDEX idx_audit_logs_org_id     ON audit_logs (org_id, created_at DESC);
CREATE INDEX idx_audit_logs_user_id    ON audit_logs (user_id, created_at DESC);
CREATE INDEX idx_audit_logs_action     ON audit_logs (action);
CREATE INDEX idx_audit_logs_resource   ON audit_logs (resource_type, resource_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- Helper function: log_audit_event
-- Use this from Edge Functions or API routes via the admin client.
-- ─────────────────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION log_audit_event(
  p_org_id        UUID,
  p_user_id       UUID,
  p_action        TEXT,
  p_resource_type TEXT,
  p_resource_id   TEXT DEFAULT NULL,
  p_metadata      JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _id UUID;
BEGIN
  INSERT INTO audit_logs (org_id, user_id, action, resource_type, resource_id, metadata)
  VALUES (p_org_id, p_user_id, p_action, p_resource_type, p_resource_id, p_metadata)
  RETURNING id INTO _id;
  RETURN _id;
END;
$$;

-- ─────────────────────────────────────────────────────────────────────────────
-- Standard action constants (use these in your application code)
-- ─────────────────────────────────────────────────────────────────────────────

-- AUTH
-- 'auth.login'              user signed in
-- 'auth.logout'             user signed out
-- 'auth.password_changed'   user changed password

-- MEMBERS
-- 'member.invited'          invitation sent
-- 'member.joined'           invitation accepted
-- 'member.removed'          member removed from org
-- 'member.role_changed'     member role updated

-- BILLING
-- 'subscription.created'    new subscription
-- 'subscription.upgraded'   plan changed to higher tier
-- 'subscription.downgraded' plan changed to lower tier
-- 'subscription.canceled'   subscription canceled
-- 'subscription.reactivated' subscription reactivated

-- API KEYS
-- 'api_key.created'         new API key created
-- 'api_key.revoked'         API key revoked

-- ORGANIZATION
-- 'org.created'             organization created
-- 'org.updated'             organization settings changed
-- 'org.deleted'             organization deleted
