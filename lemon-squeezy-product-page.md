# Lemon Squeezy — Product Page Copy
# Next.js + Supabase SaaS Starter Kit

---

## Product name
Next.js + Supabase SaaS Starter Kit

## Tagline
53 production-ready files. Clone it, set env vars, ship your SaaS in 15 minutes.

## Price
MX$1,940 (~$97 USD) — launch price (→ MX$2,980 / $149 after launch)

---

## Short description (120-160 chars)
Complete Next.js 15 + Supabase boilerplate with auth, multi-tenant orgs, Stripe billing, emails, and 53 files ready for production.

---

## Full description (product page body)

---

### Stop rebuilding the same SaaS foundation from scratch

Every SaaS app needs the same 8 things before you can build the actual product:

1. Auth (email + OAuth)
2. User profiles
3. Organizations and teams
4. Role-based access control
5. Stripe subscriptions
6. Transactional emails
7. A working dashboard
8. Database with proper security

Most developers spend **2-4 weeks** building this. Then they do it again for the next project. And the next.

This kit gives you all 8 — done, tested, and wired together — so you can start building what actually matters on day one.

---

### What's included

**53 production-ready files** organized exactly as you'd expect in a real app.

#### Auth (complete)
- Email/password login and registration with email confirmation
- Google OAuth
- Forgot password + reset password flow
- Session management with `@supabase/ssr` (App Router compatible)
- Middleware that protects routes and redirects correctly

#### Multi-tenant organizations
- Create org on signup (3-step onboarding)
- 4 roles: owner, admin, member, viewer
- Role-based permissions enforced at the database level (RLS)
- Organization settings page

#### Team management
- Invite members by email (sends actual invitation email)
- Token-based invitation acceptance
- Pending invites list
- Remove members

#### Stripe billing (fully wired)
- Pricing page with plan comparison
- Stripe Checkout integration
- Stripe Billing Portal (manage, cancel, update)
- 4 webhook events handled: `checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`
- Subscription status synced to Supabase automatically

#### Transactional emails (React Email + Resend)
- Welcome email (sent automatically on signup)
- Team invitation email with expiry date
- Payment receipt / invoice email

#### Dashboard
- Stats overview with 4 metric cards
- Getting started checklist
- Dark sidebar with navigation
- Notifications bell (real-time, mark as read)
- Analytics page (pre-wired for PostHog/Mixpanel/Plausible)

#### Settings
- Profile settings with Server Actions (actually saves)
- Password change
- Organization settings
- Danger zone (delete account, sign out everywhere)

#### Developer experience
- TypeScript throughout (strict mode)
- Full database type definitions
- 3 SQL migrations ready to run
- `useUser()`, `useSubscription()`, `useOrg()` hooks
- Reusable UI components: Button, Input, Card, Modal, Toast, Badge
- API key management (SHA-256 hashed, revocable)
- Outbound webhooks table

---

### Tech stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 15 (App Router) | Industry standard for SaaS |
| Database + Auth | Supabase | Postgres + RLS + Auth in one |
| Payments | Stripe | Most widely used payment processor |
| Email | Resend + React Email | Type-safe, great deliverability |
| Styling | Tailwind CSS | Fast, consistent UI |
| Deployment | Vercel | Zero-config, scales automatically |
| Language | TypeScript | Catches bugs before they ship |

---

### What you get

```
53 files including:

app/
  (auth)/         login, signup, forgot-password, reset-password
  (dashboard)/    dashboard, team, billing, analytics, settings, org
  api/            9 API routes (auth, invitations, profile,
                  notifications, api-keys, billing, stripe webhooks)
  invite/[token]/ accept team invitations

components/
  dashboard/      Sidebar, NotificationsBell
  ui/             Button, Input, Card, Modal, Toast, Badge

emails/           welcome, invite, invoice (React Email)
hooks/            useUser, useSubscription, useOrg
lib/              supabase client+server, email, utils, types
supabase/         3 migrations (schema + RLS + triggers)
middleware.ts     session + route protection
```

---

### Who this is for

✅ Developers building a SaaS product and don't want to spend weeks on boilerplate  
✅ Freelancers who build SaaS apps for clients repeatedly  
✅ Founders who want to validate an idea fast without skipping security  
✅ Developers who know Next.js + Supabase but want the pieces pre-assembled  

---

### Who this is NOT for

❌ Beginners learning Next.js for the first time  
❌ Projects that don't need multi-tenancy or subscriptions  
❌ Teams that want a drag-and-drop no-code builder  

---

### FAQ

**Q: Does this work with the latest Next.js App Router?**
A: Yes. Built entirely with App Router, Server Components, and Server Actions. No Pages Router code.

**Q: Can I use this for client projects?**
A: Yes. One purchase, use in unlimited projects including commercial and client work.

**Q: What Supabase plan do I need?**
A: The free tier is enough to start. You'll need a paid plan when you go to production and need more database resources.

**Q: Is Stripe required?**
A: No. The billing pages and API routes are self-contained — you can remove them if your project doesn't need payments.

**Q: How long does setup actually take?**
A: For an experienced developer: 15-30 minutes. The `.env.example` has comments explaining every variable and where to find it.

**Q: Can I add this to an existing project?**
A: It's designed as a starting point, not a plugin. Best used when starting a new project.

**Q: Is there a refund policy?**
A: 30-day no-questions-asked refund if the kit doesn't work as described.

---

## Tags
next.js, supabase, saas, boilerplate, starter kit, stripe, typescript, tailwind, auth, multi-tenant

## Category
Developer Tools / Boilerplate

---

## Thumbnail image brief
- Background: dark (split — left dark gray, right dark blue/black)
- Left side: large bold white text "SaaS Starter Kit", subtext "Next.js + Supabase"
- Right side: file tree or code snippet showing the project structure
- Accent colors: Supabase green #3ECF8E + Next.js blue/white
- Bottom strip: logos of Next.js, Supabase, Stripe, Resend, Vercel
- Size: 1600×1200px (Lemon Squeezy recommended)
