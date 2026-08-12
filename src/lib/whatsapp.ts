import 'server-only'

type WhatsappTemplate = 'leave_confirmation' | 'leave_return' | 'admission_activated'

type SendWhatsappInput = {
  to: string
  template: WhatsappTemplate
  variables: Record<string, string>
  fallbackBody: string
}

function normalizeIndianPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`
  return null
}

function templateSid(template: WhatsappTemplate) {
  if (template === 'leave_confirmation') return process.env.TWILIO_LEAVE_CONFIRMATION_CONTENT_SID
  if (template === 'leave_return') return process.env.TWILIO_LEAVE_RETURN_CONTENT_SID
  return process.env.TWILIO_ADMISSION_ACTIVATED_CONTENT_SID
}

export async function sendWhatsappMessage(input: SendWhatsappInput) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER
  if (!accountSid || !authToken || !fromNumber) {
    return { sent: false, reason: 'not_configured' as const }
  }

  const recipient = normalizeIndianPhone(input.to)
  if (!recipient) return { sent: false, reason: 'invalid_recipient' as const }

  const body = new URLSearchParams({
    From: fromNumber.startsWith('whatsapp:') ? fromNumber : `whatsapp:${fromNumber}`,
    To: `whatsapp:${recipient}`,
  })
  const contentSid = templateSid(input.template)
  if (contentSid) {
    body.set('ContentSid', contentSid)
    body.set('ContentVariables', JSON.stringify(input.variables))
  } else {
    body.set('Body', input.fallbackBody)
  }

  try {
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${encodeURIComponent(accountSid)}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
      cache: 'no-store',
    })
    const payload = await response.json() as { sid?: string; message?: string }
    if (!response.ok) {
      console.error('WhatsApp delivery failed', { status: response.status, message: payload.message })
      return { sent: false, reason: 'provider_error' as const }
    }
    return { sent: true, id: payload.sid }
  } catch (error) {
    console.error('WhatsApp delivery failed', { message: error instanceof Error ? error.message : 'Unknown error' })
    return { sent: false, reason: 'provider_error' as const }
  }
}

export function sendLeaveConfirmationWhatsapp(input: {
  to: string
  studentName: string
  rollNumber: string
  departureDate: string
  returnDate: string
}) {
  return sendWhatsappMessage({
    to: input.to,
    template: 'leave_confirmation',
    variables: {
      '1': input.studentName,
      '2': input.departureDate,
      '3': input.returnDate,
      '4': input.rollNumber,
    },
    fallbackBody: `नमस्कार ${input.studentName}, ${input.departureDate} ते ${input.returnDate} पर्यंतची सुट्टी नोंद झाली आहे. कृपया ${input.returnDate} रोजी अकॅडमीत परत या. विद्यार्थी ID: ${input.rollNumber} — शिवरक्षक करिअर अकॅडमी`,
  })
}

export function sendLeaveReturnWhatsapp(input: {
  to: string
  studentName: string
  rollNumber: string
  returnDate: string
}) {
  return sendWhatsappMessage({
    to: input.to,
    template: 'leave_return',
    variables: {
      '1': input.studentName,
      '2': input.returnDate,
      '3': input.rollNumber,
    },
    fallbackBody: `नमस्कार ${input.studentName}, तुमची सुट्टी आज ${input.returnDate} रोजी संपत आहे. कृपया शिवरक्षक करिअर अकॅडमीमध्ये वेळेवर परत या. विद्यार्थी ID: ${input.rollNumber}`,
  })
}

export function sendAdmissionActivatedWhatsapp(input: {
  to: string
  studentName: string
  rollNumber: string
  printUrl: string
}) {
  return sendWhatsappMessage({
    to: input.to,
    template: 'admission_activated',
    variables: {
      '1': input.studentName,
      '2': input.rollNumber,
      '3': input.printUrl,
    },
    fallbackBody: `नमस्कार ${input.studentName}, तुमची fee entry पूर्ण झाली आहे. विद्यार्थी ID: ${input.rollNumber}. 3 पानी प्रवेश अर्ज Print/PDF: ${input.printUrl} — शिवरक्षक करिअर अकॅडमी`,
  })
}
