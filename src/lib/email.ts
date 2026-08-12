import 'server-only'

import { Resend } from 'resend'

type SendEmailInput = {
  to: string | string[]
  subject: string
  html: string
  attachments?: Array<{ filename: string; content: string }>
  idempotencyKey?: string
}

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;')

function getEmailClient() {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) return null
  return new Resend(apiKey)
}

export async function sendTransactionalEmail(input: SendEmailInput) {
  const resend = getEmailClient()
  const from = process.env.RESEND_FROM_EMAIL
  if (!resend || !from) return { sent: false, reason: 'not_configured' as const }

  const { idempotencyKey, ...message } = input
  const { data, error } = idempotencyKey
    ? await resend.emails.send({ from, ...message }, { idempotencyKey })
    : await resend.emails.send({ from, ...message })
  if (error) {
    console.error('Transactional email failed', { name: error.name, message: error.message })
    return { sent: false, reason: 'provider_error' as const }
  }

  return { sent: true, id: data?.id }
}

export async function sendLeaveConfirmationEmail(input: {
  leaveId: string
  to: string
  studentName: string
  rollNumber: string
  departureDate: string
  returnDate: string
  reason: string
}) {
  const studentName = escapeHtml(input.studentName)
  const rollNumber = escapeHtml(input.rollNumber)
  const reason = escapeHtml(input.reason || 'वैयक्तिक कारण')
  return sendTransactionalEmail({
    to: input.to,
    subject: `सुट्टी नोंद झाली — ${input.rollNumber}`,
    idempotencyKey: `student-leave-confirmation/${input.leaveId}`,
    html: `<h2>शिवरक्षक करिअर अकॅडमी</h2><p>नमस्कार ${studentName}, तुमची सुट्टी नोंद यशस्वी झाली आहे.</p><p><strong>विद्यार्थी ID:</strong> ${rollNumber}<br/><strong>जाण्याची तारीख:</strong> ${escapeHtml(input.departureDate)}<br/><strong>परत येण्याची तारीख:</strong> ${escapeHtml(input.returnDate)}<br/><strong>कारण:</strong> ${reason}</p><p>कृपया दिलेल्या परत येण्याच्या तारखेला अकॅडमीमध्ये वेळेवर उपस्थित राहा.</p>`,
  })
}

export async function sendLeaveReturnReminderEmail(input: {
  leaveId: string
  to: string
  studentName: string
  rollNumber: string
  returnDate: string
  returnDateKey: string
}) {
  return sendTransactionalEmail({
    to: input.to,
    subject: `आज अकॅडमीमध्ये परत येण्याची तारीख — ${input.rollNumber}`,
    idempotencyKey: `student-leave-return/${input.leaveId}/${input.returnDateKey}`,
    html: `<h2>शिवरक्षक करिअर अकॅडमी</h2><p>नमस्कार ${escapeHtml(input.studentName)}, तुमची सुट्टी आज <strong>${escapeHtml(input.returnDate)}</strong> रोजी संपत आहे.</p><p>कृपया अकॅडमीमध्ये वेळेवर परत उपस्थित राहा.</p><p><strong>विद्यार्थी ID:</strong> ${escapeHtml(input.rollNumber)}</p>`,
  })
}

export async function sendAdmissionEmails(input: {
  studentEmail?: string
  studentName: string
  rollNumber: string
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shivrakshak-academy1-kappa.vercel.app'
  const studentName = escapeHtml(input.studentName)
  const rollNumber = escapeHtml(input.rollNumber)
  const loginUrl = `${appUrl.replace(/\/$/, '')}/student/login?roll=${encodeURIComponent(input.rollNumber)}`
  const jobs: Promise<unknown>[] = []

  if (input.studentEmail) {
    jobs.push(sendTransactionalEmail({
      to: input.studentEmail,
      subject: `प्रवेश यशस्वी — विद्यार्थी ID ${input.rollNumber}`,
      html: `<h2>शिवरक्षक करिअर अकॅडमी</h2><p>नमस्कार ${studentName}, तुमचा प्रवेश अर्ज यशस्वी झाला आहे.</p><p><strong>विद्यार्थी ID: ${rollNumber}</strong></p><p>Online परीक्षा देण्यासाठी <a href="${loginUrl}">Student Exam Login</a> उघडा आणि अर्जात तयार केलेला password वापरा.</p><p>सुरक्षेसाठी तुमचा password या ई-मेलमध्ये पाठवलेला नाही.</p>`,
    }))
  }

  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL
  if (adminEmail) {
    jobs.push(sendTransactionalEmail({
      to: adminEmail,
      subject: `नवीन प्रवेश — ${input.rollNumber}`,
      html: `<h2>नवीन विद्यार्थी प्रवेश</h2><p><strong>${studentName}</strong> यांचा प्रवेश पूर्ण झाला.</p><p>विद्यार्थी ID: <strong>${rollNumber}</strong></p>`,
    }))
  }

  await Promise.allSettled(jobs)
}

export async function sendAdmissionActivatedEmail(input: {
  to: string
  studentName: string
  rollNumber: string
  printUrl: string
}) {
  const loginUrl = `${(process.env.NEXT_PUBLIC_APP_URL || 'https://shivrakshak-academy1-kappa.vercel.app').replace(/\/$/, '')}/student/login?roll=${encodeURIComponent(input.rollNumber)}`
  return sendTransactionalEmail({
    to: input.to,
    subject: `प्रवेश मंजूर — विद्यार्थी ID ${input.rollNumber}`,
    idempotencyKey: `admission-activated/${input.rollNumber}`,
    html: `<h2>शिवरक्षक करिअर अकॅडमी</h2><p>नमस्कार ${escapeHtml(input.studentName)}, तुमची fee entry पूर्ण झाली आहे आणि प्रवेश मंजूर झाला आहे.</p><p><strong>विद्यार्थी ID: ${escapeHtml(input.rollNumber)}</strong></p><p><a href="${input.printUrl}">3 पानी प्रवेश अर्ज Print / Save as PDF करा</a></p><p><a href="${loginUrl}">Student Exam Login उघडा</a> आणि अर्ज भरताना तयार केलेला password वापरा.</p>`,
  })
}

export async function sendExamScheduleEmails(input: {
  recipients: string[]
  examTitle: string
  startsAt: string | null
  endsAt: string | null
  isRescheduled: boolean
}) {
  const recipients = [...new Set(input.recipients.filter(Boolean))].slice(0, 100)
  if (recipients.length === 0) return

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shivrakshak-academy1-kappa.vercel.app'
  const subjectPrefix = input.isRescheduled ? 'परीक्षेचे वेळापत्रक बदलले' : 'नवीन Online परीक्षा'
  const examTitle = escapeHtml(input.examTitle)
  const schedule = [input.startsAt, input.endsAt]
    .filter(Boolean)
    .map((value) => new Date(value as string).toLocaleString('mr-IN', { timeZone: 'Asia/Kolkata' }))
    .join(' ते ')

  await Promise.allSettled(recipients.map((to) => sendTransactionalEmail({
    to,
    subject: `${subjectPrefix} — ${input.examTitle}`,
    html: `<h2>${examTitle}</h2><p>${schedule ? `वेळ: <strong>${escapeHtml(schedule)}</strong>` : 'ही परीक्षा आता उपलब्ध आहे.'}</p><p><a href="${appUrl.replace(/\/$/, '')}/student/login">Student Exam Login</a></p>`,
  })))
}
