# Changelog

All notable changes to the Next.js + Supabase SaaS Starter Kit are documented here.

Format: [version] — date — description

---

## [1.0.0] — 2026-05-20

### Initial release

**Auth**
- Email/password login and signup with email confirmation
- Google OAuth via Supabase Auth
- Forgot password + reset password flow
- Session management with `@supabase/ssr` (App Router compatible)
- Middleware with route protection and auth redirects

**Organizations**
- 3-step onboarding: create org → invite team → done
- Multi-tenant architecture with org isolation
- 4 roles: owner, admin, member, viewer
- RLS helper functions: `auth.user_org_ids()`, `auth.user_org_role()`

**Team management**
- Email invitations with 7-day expiry tokens
- Token-based invitation acceptance
- Pending invites list on team page
- Role assignment at invite time

**Billing**
- Stripe Checkout integration (single payment + subscription ready)
- Stripe Billing Portal for self-service management
- 4 webhook events: checkout completed, invoice paid, subscription updated, subscription deleted
- Subscription status synced to `subscriptions` table

**Emails**
- Welcome email (auto-sent on signup via Supabase Auth webhook)
- Team invitation email with expiry date
- Invoice/receipt email with itemized breakdown
- React Email templates, sent via Resend

**Dashboard**
- Stats overview with 4 metric cards
- Getting started checklist
- Dark sidebar with primary + secondary navigation
- Notifications bell (polling, mark-as-read, unread badge)
- Analytics page with PostHog/Mixpanel/Plausible setup guide

**Settings**
- Profile settings with Server Actions (full_name update)
- Password change with Server Actions
- Organization settings (name update, slug display)
- Danger zone (UI only — actions require confirmation)

**API**
- `POST /api/auth/trigger` — Supabase Auth webhook handler
- `POST /api/invitations` — create invitation
- `POST /api/invitations/accept` — accept via token
- `GET|PATCH /api/profile` — user profile
- `GET|PATCH /api/notifications` — list + mark read
- `GET|POST|DELETE /api/api-keys` — API key management
- `POST /api/billing/create-checkout` — Stripe checkout
- `POST /api/billing/create-portal` — Stripe portal
- `POST /api/webhooks/stripe` — Stripe events

**Database**
- `001_initial_schema.sql` — core tables + RLS + helper functions + profile trigger
- `002_onboarding.sql` — documentation
- `003_notifications_triggers.sql` — notification triggers + api_keys + webhooks tables

**UI Components**
- Badge (with StatusBadge and RoleBadge helpers)
- Button (5 variants + loading state)
- Input, Textarea, Select (accessible, with label/error/hint)
- Card, CardHeader, CardContent, CardFooter, StatCard
- Modal (keyboard trap, backdrop click, scroll lock)
- Toast + useToast() hook (success/error/warning/info)

**Hooks**
- `useUser()` — auth state with listener
- `useSubscription(orgId)` — subscription with isPro/isEnterprise flags
- `useOrg(orgId?)` — org membership with role helpers

**Config**
- `vercel.json` — all env vars mapped
- `.env.example` — all variables documented with comments
- `tsconfig.json` — strict mode + path aliases
- `tailwind.config.ts` — content paths including emails/
- `next.config.ts` — React Email external packages + image domains
- `package.json` — db:types, db:types:remote, email:preview scripts
