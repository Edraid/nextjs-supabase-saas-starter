# nextjs-supabase-saas-starter

SaaS boilerplate con Next.js 15, Supabase, Stripe y autenticación multi-tenant lista para producción.

## Stack

- **Framework**: Next.js 15 (App Router)
- **Base de datos / Auth**: Supabase + RLS
- **Pagos**: Stripe (checkout + webhooks)
- **Emails**: Resend + React Email
- **Estilos**: Tailwind CSS + Radix UI
- **Deploy**: Vercel

## Comandos principales

```bash
npm run dev           # servidor de desarrollo en localhost:3000
npm run build         # build de producción
npm run lint          # ESLint
npm run typecheck     # TypeScript sin emit
npm run db:types      # regenerar tipos desde Supabase local
npm run db:types:remote  # regenerar tipos desde Supabase remoto
npm run email:preview # previsualizar emails en localhost:3001
```

Para Stripe webhooks en local:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

## Estructura clave

```
app/
  (auth)/          — login, signup, forgot/reset password
  auth/callback/   — OAuth callback
  onboarding/      — setup de org en 3 pasos
  invite/[token]/  — aceptar invitación de equipo
  (dashboard)/     — shell protegido con sidebar
app/api/
  auth/trigger/    — webhook Supabase → email bienvenida
  billing/         — checkout + portal Stripe
  webhooks/stripe/ — eventos Stripe
  invitations/     — crear + aceptar invitaciones
  notifications/   — listar + marcar leídas
  api-keys/        — CRUD llaves API (hasheadas SHA-256)
components/
  dashboard/       — Sidebar, NotificationsBell
  ui/              — Button, Input, Card, Modal, Toast, Badge
emails/            — plantillas React Email
hooks/             — useUser, useSubscription, useOrg
lib/
  supabase/        — client, server, admin
  email.ts         — helpers de envío
  database.types.ts — tipos TypeScript (auto-generado)
supabase/migrations/ — 4 migraciones SQL
middleware.ts      — protección de rutas + refresh de sesión
```

## Patrones importantes

### Auth en Server Component
```typescript
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser() // usar getUser(), NO getSession()
if (!user) redirect('/login')
```

### RLS — evitar recursión infinita
Las políticas usan `auth.user_org_role(org_id)` (SECURITY DEFINER) en lugar de
hacer JOIN a `organization_members` directamente. Ver `supabase/migrations/001_initial_schema.sql`.

### Variables de entorno requeridas
Ver `.env.example` — todas las variables están documentadas con comentarios.

## Variables de entorno

Copiar `.env.example` a `.env.local` y completar:
- `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` + `STRIPE_WEBHOOK_SECRET` + precios
- `RESEND_API_KEY`
- `NEXT_PUBLIC_APP_URL`
