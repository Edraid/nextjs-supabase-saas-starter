import { Resend } from 'resend'
import { WelcomeEmail } from '@/emails/welcome'
import { InviteEmail } from '@/emails/invite'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.EMAIL_FROM ?? 'hello@yourdomain.com'
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function sendWelcomeEmail(to: string, firstName: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: `Welcome to the app, ${firstName}!`,
    react: WelcomeEmail({ firstName, appUrl: APP_URL }),
  })
}

export async function sendInviteEmail({
  to,
  invitedByName,
  orgName,
  role,
  token,
}: {
  to: string
  invitedByName: string
  orgName: string
  role: string
  token: string
}) {
  const inviteUrl = `${APP_URL}/invite/${token}`

  return resend.emails.send({
    from: FROM,
    to,
    subject: `${invitedByName} invited you to join ${orgName}`,
    react: InviteEmail({ invitedByName, orgName, role, inviteUrl }),
  })
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  return resend.emails.send({
    from: FROM,
    to,
    subject: 'Reset your password',
    html: `
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}">Reset password</a></p>
      <p>If you didn't request this, ignore this email.</p>
    `,
  })
}
