# Next.js + Supabase SaaS Starter Kit

> Production-ready SaaS boilerplate — auth, multi-tenant orgs, Stripe billing, transactional emails, and 57 files ready to deploy. Ship in 15 minutes, not 4 weeks.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-ready-3ECF8E?logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript)
![Stripe](https://img.shields.io/badge/Stripe-billing-635BFF?logo=stripe)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## Why this exists

Every SaaS project starts the same way:

- Week 1: Auth (email, OAuth, forgot password, reset)
- Week 2: User profiles, organizations, roles
- Week 3: Stripe subscriptions + webhooks
- Week 4: Emails, dashboard, settings

That's **4 weeks before you write a single line of your actual product**. This kit skips all of it.

---

## What's included

| Feature | Details |
|---------|---------|
| **Auth** | Email/password + Google OAuth + forgot/reset. `@supabase/ssr` compatible |
| **Multi-tenant orgs** | Owner, admin, member, viewer — enforced at DB level with RLS |
| **Team invitations** | Token-based, email delivery, role assignment |
| **Stripe billing** | Checkout + Billing Portal + 4 webhooks handled |
| **Transactional emails** | Welcome, invite, invoice — React Email + Resend |
| **Notifications** | Real-time bell, unread badge, mark-as-read |
| **API key management** | SHA-256 hashed, revocable, org-scoped |
| **Audit log** | Append-only, 12 event types, admin-only view |
| **Dashboard** | Sidebar, stats, settings, analytics placeholder |
| **TypeScript** | Strict mode, full DB types, 3 hooks |

---

## Tech stack

```
Next.js 15 (App Router)  →  Framework
Supabase                 →  Database + Auth + RLS
Stripe                   →  Payments
Resend + React Email     →  Transactional emails
Tailwind CSS             →  Styling
TypeScript               →  Type safety
Vercel                   →  Deployment
```

---

## Quick start

### 1. Clone and install

```bash
git clone https://github.com/Edraid/nextjs-supabase-saas-starter
cd nextjs-supabase-saas-starter
npm install
```

### 2. Set up environment

```bash
cp .env.example .env.local
# Fill in all values — see comments in .env.example
```

### 3. Run database migrations

```bash
# Option A: Supabase CLI
npx supabase link --project-ref YOUR_PROJECT_ID
npx supabase db push

# Option B: SQL editor
# Paste supabase/migrations/001_initial_schema.sql and run
# Then paste 003_notifications_triggers.sql
# Then paste 004_audit_log.sql
```

### 4. Configure Supabase Auth

1. Dashboard → Authentication → Providers → enable Email + Google
2. Authentication → URL Configuration → add `http://localhost:3000/auth/callback`

### 5. Start dev server

```bash
# Terminal 1
npm run dev

# Terminal 2 (Stripe webhooks)
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

---

## Project structure

```
├── app/
│   ├── (auth)/                  # login, signup, forgot-password, reset-password
│   ├── auth/callback/           # OAuth callback
│   ├── onboarding/              # 3-step org setup
│   ├── invite/[token]/          # accept team invitation
│   └── (dashboard)/             # protected shell
│       ├── layout.tsx           # auth check + sidebar + notifications
│       ├── dashboard/           # home
│       ├── team/                # members + invite
│       ├── billing/             # Stripe plans
│       ├── analytics/           # analytics setup
│       ├── api-keys/            # API key management UI
│       ├── audit-log/           # audit log (admins)
│       ├── settings/            # profile + password
│       └── org/                 # organization settings
├── app/api/
│   ├── auth/trigger/            # Supabase webhook → welcome email
│   ├── invitations/             # create + accept
│   ├── profile/                 # GET + PATCH
│   ├── notifications/           # list + mark-read
│   ├── api-keys/                # CRUD (hashed)
│   ├── billing/                 # checkout + portal
│   └── webhooks/stripe/         # Stripe events
├── components/
│   ├── dashboard/               # Sidebar, NotificationsBell
│   └── ui/                      # Button, Input, Card, Modal, Toast, Badge
├── emails/                      # welcome, invite, invoice (React Email)
├── hooks/                       # useUser, useSubscription, useOrg
├── lib/
│   ├── supabase/                # client + server + admin clients
│   ├── email.ts                 # sendWelcomeEmail, sendInviteEmail, ...
│   ├── utils.ts                 # cn, formatDate, relativeTime, ...
│   └── database.types.ts        # TypeScript types (regenerate with npm run db:types)
├── supabase/migrations/         # 4 SQL migrations
├── middleware.ts                # session refresh + route protection
└── .env.example                 # all variables documented
```

---

## Auth patterns

### Server Component
```typescript
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function Page() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
}
```

### Server Action
```typescript
async function updateProfile(formData: FormData) {
  'use server'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  // ...
  revalidatePath('/settings')
}
```

### Client hook
```typescript
'use client'
import { useUser } from '@/hooks/use-user'

export function Component() {
  const { user, loading } = useUser()
}
```

---

## Stripe billing flow

1. User clicks "Upgrade" → `POST /api/billing/create-checkout`
2. Redirect to Stripe Checkout (`client_reference_id` = orgId)
3. Stripe fires `checkout.session.completed`
4. Webhook upserts `subscriptions` table via service role
5. RLS helper `auth.user_org_ids()` gates premium features automatically

---

## Deploy to Vercel

```bash
vercel
```

**Post-deploy checklist:**
- [ ] Add production URL to Supabase → Auth → Redirect URLs
- [ ] Add `https://yourdomain.com/api/webhooks/stripe` in Stripe → Webhooks
- [ ] Set all env vars in Vercel project settings
- [ ] Run migrations on production database

---

## Database types

After schema changes:
```bash
npm run db:types          # local Supabase
npm run db:types:remote   # remote project
```

---

## Contributing

PRs welcome. Please open an issue first for major changes.

---

## License

MIT — use in personal and commercial projects.

---

## Support

If this saved you time, consider:
- ⭐ Starring this repo
- 🐦 Following [@Edraid1](https://twitter.com/Edraid1) for more Supabase + Next.js content
- 💬 Opening an issue if something doesn't work
