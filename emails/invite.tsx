import {
  Body, Button, Container, Head, Heading,
  Hr, Html, Link, Preview, Section, Text,
} from '@react-email/components'

interface InviteEmailProps {
  invitedByName: string
  orgName: string
  role: string
  inviteUrl: string
  expiresInDays?: number
}

export function InviteEmail({
  invitedByName,
  orgName,
  role,
  inviteUrl,
  expiresInDays = 7,
}: InviteEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{invitedByName} invited you to join {orgName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>You're invited to {orgName}</Heading>

          <Text style={text}>
            <strong>{invitedByName}</strong> has invited you to join{' '}
            <strong>{orgName}</strong> as a <strong>{role}</strong>.
          </Text>

          <Section style={buttonContainer}>
            <Button href={inviteUrl} style={button}>
              Accept invitation →
            </Button>
          </Section>

          <Text style={note}>
            This invitation expires in {expiresInDays} days. If you don't have an account,
            you'll be able to create one after accepting.
          </Text>

          <Hr style={hr} />

          <Text style={footer}>
            If you weren't expecting this invitation, you can ignore this email.
          </Text>
          <Text style={footer}>
            Or copy this link:{' '}
            <Link href={inviteUrl} style={link}>{inviteUrl}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '40px 32px', borderRadius: '8px', maxWidth: '520px', marginTop: '40px', marginBottom: '40px' }
const h1 = { color: '#111827', fontSize: '24px', fontWeight: '600', margin: '0 0 16px' }
const text = { color: '#374151', fontSize: '15px', lineHeight: '24px', margin: '0 0 24px' }
const buttonContainer = { margin: '24px 0' }
const button = { backgroundColor: '#2563eb', borderRadius: '6px', color: '#ffffff', fontSize: '14px', fontWeight: '600', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }
const note = { color: '#6b7280', fontSize: '13px', lineHeight: '20px', margin: '16px 0 0' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { color: '#9ca3af', fontSize: '12px', lineHeight: '20px', margin: '0 0 4px' }
const link = { color: '#6b7280' }
