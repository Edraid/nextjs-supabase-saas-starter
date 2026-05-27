import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface WelcomeEmailProps {
  firstName: string
  appUrl: string
}

export function WelcomeEmail({ firstName, appUrl }: WelcomeEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Welcome to the app, {firstName}! Here's how to get started.</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Welcome, {firstName} 👋</Heading>

          <Text style={text}>
            Your account is ready. Here's what you can do next:
          </Text>

          <Section style={checklist}>
            <Text style={checklistItem}>✓ Invite your team members</Text>
            <Text style={checklistItem}>✓ Set up your billing</Text>
            <Text style={checklistItem}>✓ Explore your dashboard</Text>
          </Section>

          <Section style={buttonContainer}>
            <Button href={`${appUrl}/dashboard`} style={button}>
              Go to dashboard →
            </Button>
          </Section>

          <Hr style={hr} />

          <Text style={footer}>
            Questions? Reply to this email — we read every message.
          </Text>
          <Text style={footer}>
            <Link href={appUrl} style={link}>{appUrl}</Link>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '40px 32px',
  borderRadius: '8px',
  maxWidth: '520px',
  marginTop: '40px',
  marginBottom: '40px',
}

const h1 = {
  color: '#111827',
  fontSize: '24px',
  fontWeight: '600',
  margin: '0 0 16px',
}

const text = {
  color: '#374151',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0 0 16px',
}

const checklist = {
  margin: '0 0 24px',
}

const checklistItem = {
  color: '#374151',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 4px',
}

const buttonContainer = {
  margin: '24px 0',
}

const button = {
  backgroundColor: '#2563eb',
  borderRadius: '6px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
  display: 'inline-block',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '24px 0',
}

const footer = {
  color: '#9ca3af',
  fontSize: '12px',
  lineHeight: '20px',
  margin: '0 0 4px',
}

const link = {
  color: '#9ca3af',
}
