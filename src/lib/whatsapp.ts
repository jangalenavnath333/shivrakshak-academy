import 'server-only'

type WhatsappTemplate = 'leave_confirmation' | 'leave_return' | 'admission_activated' | 'admin_broadcast'

type SendWhatsappInput = {
  to: string
  template: WhatsappTemplate
  variables: Record<string, string>
  fallbackBody: string
}

/**
 * Returns E.164 for a usable Indian mobile number, or null when the value cannot be
 * dialled. Exported so callers can report unreachable recipients without attempting a send.
 */
export function normalizeIndianPhone(value: string) {
  const digits = value.replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  if (digits.length >= 10 && digits.length <= 15) return `+${digits}`
  return null
}

const TEMPLATE_SID_ENV: Record<WhatsappTemplate, string> = {
  leave_confirmation: 'TWILIO_LEAVE_CONFIRMATION_CONTENT_SID',
  leave_return: 'TWILIO_LEAVE_RETURN_CONTENT_SID',
  admission_activated: 'TWILIO_ADMISSION_ACTIVATED_CONTENT_SID',
  admin_broadcast: 'TWILIO_ADMIN_BROADCAST_CONTENT_SID',
}

function templateSid(template: WhatsappTemplate) {
  return process.env[TEMPLATE_SID_ENV[template]]
}

/** True when Twilio credentials are present, so callers can fail fast before a batch. */
export function isWhatsappConfigured() {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_WHATSAPP_NUMBER)
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
    const payload = await response.json() as { sid?: string; message?: string; code?: number }
    if (!response.ok) {
      console.error('WhatsApp delivery failed', { status: response.status, code: payload.code, message: payload.message })
      // Twilio's message describes the account/recipient problem and contains no
      // credentials, so it is safe — and necessary — to show the admin.
      return { sent: false, reason: 'provider_error' as const, detail: describeTwilioError(payload.code, payload.message) }
    }
    return { sent: true, id: payload.sid }
  } catch (error) {
    console.error('WhatsApp delivery failed', { message: error instanceof Error ? error.message : 'Unknown error' })
    return { sent: false, reason: 'provider_error' as const, detail: 'Twilio ला संपर्क होऊ शकला नाही' }
  }
}

/** Turns a Twilio error into something an admin can act on. Never includes credentials. */
function describeTwilioError(code?: number, message?: string) {
  // 21608 / 63007-style trial restrictions are by far the most common in testing.
  if (code === 21608 || /trial/i.test(message || '')) {
    return 'Twilio trial मध्ये हा नंबर verified/test recipient नाही. Twilio Console → Verified Caller IDs मध्ये नंबर verify करा, किंवा WhatsApp sandbox ला "join <code>" पाठवा.'
  }
  if (code === 63007) return 'Twilio WhatsApp sender (From नंबर) सापडला नाही — TWILIO_WHATSAPP_NUMBER तपासा.'
  if (code === 63016) return '24-तासांची window संपली आहे. Free-form message ऐवजी approved template (ContentSid) आवश्यक आहे.'
  if (code === 63018) return 'Twilio rate limit — थोड्या वेळाने पुन्हा प्रयत्न करा.'
  if (code === 21211 || code === 21614) return 'हा मोबाईल नंबर WhatsApp साठी वैध नाही.'
  return message || 'Twilio कडून message नाकारला गेला.'
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

/**
 * Admin-composed broadcast. Sends the composed text as a free-form Body, which is what
 * the Twilio sandbox supports. Setting TWILIO_ADMIN_BROADCAST_CONTENT_SID switches this
 * to an approved template, with the student name and message as variables 1 and 2.
 */
export function sendAdminBroadcastWhatsapp(input: {
  to: string
  studentName: string
  message: string
}) {
  return sendWhatsappMessage({
    to: input.to,
    template: 'admin_broadcast',
    variables: {
      '1': input.studentName,
      '2': input.message,
    },
    fallbackBody: input.message,
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
