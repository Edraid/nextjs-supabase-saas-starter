import {
  Body, Button, Container, Head, Heading,
  Hr, Html, Preview, Row, Column, Section, Text,
} from '@react-email/components'

interface InvoiceEmailProps {
  customerName: string
  invoiceNumber: string
  amount: string
  period: string
  planName: string
  invoiceUrl: string
  appUrl: string
}

export function InvoiceEmail({
  customerName,
  invoiceNumber,
  amount,
  period,
  planName,
  invoiceUrl,
  appUrl,
}: InvoiceEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your invoice for {period} — {amount}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Payment receipt</Heading>

          <Text style={text}>Hi {customerName},</Text>
          <Text style={text}>
            Thanks for your payment. Here's your receipt for the {planName} plan.
          </Text>

          {/* Invoice summary */}
          <Section style={invoiceBox}>
            <Row>
              <Column><Text style={label}>Invoice</Text></Column>
              <Column align="right"><Text style={value}>{invoiceNumber}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={label}>Period</Text></Column>
              <Column align="right"><Text style={value}>{period}</Text></Column>
            </Row>
            <Row>
              <Column><Text style={label}>Plan</Text></Column>
              <Column align="right"><Text style={value}>{planName}</Text></Column>
            </Row>
            <Hr style={{ borderColor: '#e5e7eb', margin: '8px 0' }} />
            <Row>
              <Column><Text style={{ ...label, fontWeight: '600', color: '#111827' }}>Total</Text></Column>
              <Column align="right"><Text style={{ ...value, fontWeight: '700', fontSize: '16px', color: '#111827' }}>{amount}</Text></Column>
            </Row>
          </Section>

          <Section style={{ margin: '24px 0' }}>
            <Button href={invoiceUrl} style={button}>
              Download invoice PDF →
            </Button>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            Questions about this charge? Reply to this email and we'll help you out.
          </Text>
          <Text style={footer}>{appUrl}</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#f6f9fc', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }
const container = { backgroundColor: '#ffffff', margin: '0 auto', padding: '40px 32px', borderRadius: '8px', maxWidth: '520px', marginTop: '40px', marginBottom: '40px' }
const h1 = { color: '#111827', fontSize: '24px', fontWeight: '600', margin: '0 0 16px' }
const text = { color: '#374151', fontSize: '15px', lineHeight: '24px', margin: '0 0 12px' }
const invoiceBox = { backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px 20px', margin: '20px 0' }
const label = { color: '#6b7280', fontSize: '13px', margin: '4px 0' }
const value = { color: '#374151', fontSize: '13px', margin: '4px 0' }
const button = { backgroundColor: '#2563eb', borderRadius: '6px', color: '#ffffff', fontSize: '14px', fontWeight: '600', padding: '12px 24px', textDecoration: 'none', display: 'inline-block' }
const hr = { borderColor: '#e5e7eb', margin: '24px 0' }
const footer = { color: '#9ca3af', fontSize: '12px', lineHeight: '20px', margin: '0 0 4px' }
