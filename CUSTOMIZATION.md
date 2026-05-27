# Customization Guide

Common modifications buyers make to the starter kit. Each section shows exactly which files to change.

---

## Change the app name and branding

**Files to edit:**
- `app/layout.tsx` — update `<title>` and metadata
- `components/dashboard/sidebar.tsx` — update org avatar color (line with `bg-blue-600`)
- `app/(auth)/login/page.tsx` — update the logo/title at the top
- `tailwind.config.ts` — extend colors if adding a custom brand color
- `.env.example` → `.env.local` — update `NEXT_PUBLIC_APP_URL`

---

## Add a new dashboard page

1. Create `app/(dashboard)/your-page/page.tsx`
2. Add to the navigation in `components/dashboard/sidebar.tsx`:
```typescript
{ name: 'Your Page', href: '/your-page', icon: YourIcon }
```
3. The layout, auth check, and sidebar are inherited automatically.

---

## Add a new role or change permissions

**Files to edit:**
- `supabase/migrations/001_initial_schema.sql` — update the `role` enum in `organization_members`
- All RLS policies that reference roles (search for `'owner', 'admin'`)
- `lib/database.types.ts` — update `MemberRole` type
- `components/ui/badge.tsx` — add variant in `RoleBadge`
- `app/(dashboard)/team/page.tsx` — update role display

---

## Add a new subscription plan

**Files to edit:**
- `app/(dashboard)/billing/page.tsx` — add to the `PLANS` array
- `.env.local` — add `STRIPE_PRICE_ID_[PLAN]_MONTHLY` and `_ANNUAL`
- `hooks/use-subscription.ts` — add flag if needed (e.g. `isEnterprise`)
- `supabase/migrations/001_initial_schema.sql` — add plan to `subscriptions.plan` enum
- `app/api/webhooks/stripe/route.ts` — map new price IDs to plan names

---

## Change the email provider (replace Resend)

**Files to edit:**
- `lib/email.ts` — swap `resend.emails.send()` for your provider's SDK
- `package.json` — replace `resend` dependency
- `.env.example` — update API key variable name

The email template files (`emails/*.tsx`) stay the same — they're provider-agnostic React components.

---

## Add a new email template

1. Create `emails/your-email.tsx` (copy `emails/invite.tsx` as base)
2. Add a function in `lib/email.ts`:
```typescript
export async function sendYourEmail(to: string, props: YourEmailProps) {
  const html = await render(<YourEmail {...props} />)
  return resend.emails.send({
    from: process.env.EMAIL_FROM!,
    to,
    subject: 'Your subject',
    html,
  })
}
```
3. Preview with: `npm run email:preview`

---

## Remove Stripe (if you don't need billing)

1. Delete `app/(dashboard)/billing/` directory
2. Delete `app/api/billing/` directory
3. Delete `app/api/webhooks/stripe/route.ts`
4. Remove billing nav item from `components/dashboard/sidebar.tsx`
5. Remove Stripe env vars from `.env.local` and `vercel.json`
6. `npm uninstall stripe @stripe/stripe-js`

---

## Remove multi-tenancy (single-user app)

This is a bigger change. Summary:
1. Remove `organizations`, `organization_members`, `invitations` tables
2. Remove `/dashboard/team` page and invite API routes
3. Remove org-related RLS helper functions
4. Remove onboarding org creation step
5. Change billing to link to `user_id` instead of `org_id`
6. Remove `useOrg()` hook usage

---

## Add dark mode

1. Add `darkMode: 'class'` to `tailwind.config.ts`
2. Create a theme toggle component using `next-themes`:
```bash
npm install next-themes
```
3. Wrap `app/layout.tsx` with `<ThemeProvider>`
4. Add `dark:` variants to components that need it

---

## Use a custom domain for emails

In Resend dashboard:
1. Settings → Domains → Add Domain
2. Add the DNS records to your domain provider
3. Update `EMAIL_FROM` in `.env.local` to `noreply@yourdomain.com`

---

## Deploy to a non-Vercel platform

The app is a standard Next.js app. Works on:
- **Railway** — `railway up`
- **Render** — connect GitHub repo, set env vars
- **Fly.io** — `fly launch`
- **Self-hosted** — `npm run build && npm start`

Remove `vercel.json` if not deploying to Vercel.
