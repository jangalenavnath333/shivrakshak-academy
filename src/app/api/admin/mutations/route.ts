import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminUser } from '@/lib/admin-auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { sendTransactionalEmail } from '@/lib/email'

const id = z.string().uuid()
const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('fee.create'), payload: z.object({ student_id: id, amount_paid: z.number().positive().max(10_000_000), payment_date: z.string().date(), payment_mode: z.enum(['cash', 'upi', 'bank_transfer', 'cheque']) }) }),
  z.object({ action: z.literal('fee.update'), payload: z.object({ id, amount_paid: z.number().positive().max(10_000_000), payment_date: z.string().date(), payment_mode: z.enum(['cash', 'upi', 'bank_transfer', 'cheque']) }) }),
  z.object({ action: z.literal('fee.delete'), payload: z.object({ id }) }),
  z.object({ action: z.literal('mess.create'), payload: z.object({ student_id: id, start_date: z.string().date(), end_date: z.string().date(), amount: z.number().min(0).max(10_000_000) }).refine((value) => value.end_date >= value.start_date, 'End date must not be before start date') }),
  z.object({ action: z.literal('notice.create'), payload: z.object({ title: z.string().trim().min(2).max(200), content: z.string().trim().max(5000), category: z.enum(['general', 'exam', 'result', 'holiday', 'important']), is_published: z.boolean() }) }),
  z.object({ action: z.literal('notice.toggle'), payload: z.object({ id, is_published: z.boolean() }) }),
  z.object({ action: z.literal('notice.delete'), payload: z.object({ id }) }),
  z.object({ action: z.literal('media.create'), payload: z.object({ title: z.string().trim().min(1).max(160), media_type: z.enum(['image', 'video', 'youtube']), placement: z.string().trim().min(1).max(80), url: z.string().url(), thumbnail_url: z.string().url().optional().or(z.literal('')), alt_text: z.string().max(240).optional(), sort_order: z.number().int().min(0).max(999), is_published: z.boolean() }) }),
  z.object({ action: z.literal('media.delete'), payload: z.object({ id }) }),
  z.object({ action: z.literal('settings.update'), payload: z.object({ academy_name: z.string().min(2).max(160), tagline: z.string().max(160), hero_title: z.string().max(240), hero_subtitle: z.string().max(1000), phone: z.string().max(20), whatsapp: z.string().max(20), email: z.string().email().or(z.literal('')), address: z.string().max(500), youtube_url: z.string().url().or(z.literal('')), instagram_url: z.string().url().or(z.literal('')), facebook_url: z.string().url().or(z.literal('')) }) }),
  z.object({ action: z.literal('attendance.session.create'), payload: z.object({ title: z.string().min(2).max(160), session_date: z.string().date(), mode: z.enum(['face', 'manual', 'online']), is_open: z.boolean() }) }),
  z.object({ action: z.literal('attendance.mark'), payload: z.object({ session_id: id, student_id: id, status: z.enum(['present', 'absent', 'late', 'excused']), method: z.enum(['face', 'manual', 'online']), confidence: z.number().min(0).max(1).nullable() }) }),
  z.object({ action: z.literal('exam.create'), payload: z.object({ title: z.string().min(2).max(200), description: z.string().max(2000), duration_minutes: z.number().int().min(1).max(600), total_marks: z.number().min(0).max(10000), is_live: z.boolean(), is_published: z.boolean() }) }),
  z.object({ action: z.literal('student.create'), payload: z.object({
    name: z.string().trim().min(2).max(120), parent_name: z.string().trim().max(120), address: z.string().trim().max(500),
    phone: z.string().trim().max(15), parent_phone: z.string().trim().max(15), aadhaar_no: z.string().trim().max(20),
    guarantee_letter_no: z.string().trim().max(80), dob: z.string(), course: z.enum(['police', 'navy', 'mpsc', 'staff_selection', 'saral_seva', 'army', 'railway', 'other']),
    admission_date: z.string(), duration: z.string().trim().max(80), age: z.number().int().nullable(), height: z.number().nullable(),
    weight: z.number().nullable(), chest: z.number().nullable(), gender: z.enum(['male', 'female']), total_fee: z.number().min(0).max(10_000_000),
  }) }),
  z.object({ action: z.literal('student.update'), payload: z.object({
    id, name: z.string().trim().min(2).max(120), parent_name: z.string().trim().max(120), address: z.string().trim().max(500),
    phone: z.string().trim().max(15), parent_phone: z.string().trim().max(15), aadhaar_no: z.string().trim().max(20),
    guarantee_letter_no: z.string().trim().max(80), dob: z.string(), course: z.enum(['police', 'navy', 'mpsc', 'staff_selection', 'saral_seva', 'army', 'railway', 'other']),
    admission_date: z.string(), duration: z.string().trim().max(80), age: z.number().int().nullable(), height: z.number().nullable(),
    weight: z.number().nullable(), chest: z.number().nullable(), gender: z.enum(['male', 'female']), total_fee: z.number().min(0).max(10_000_000),
    email: z.string().email().or(z.literal('')).optional(),
  }) }),
])

export async function POST(request: Request) {
  if (!await getAdminUser()) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const parsed = actionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid admin operation' }, { status: 400 })

  const supabase = await createSupabaseServerClient()
  const { action, payload } = parsed.data

  if (action === 'fee.create') {
    const { error } = await supabase.from('fee_payments').insert(payload)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  } else if (action === 'fee.update') {
    const { error } = await supabase.from('fee_payments').update({ amount_paid: payload.amount_paid, payment_date: payload.payment_date, payment_mode: payload.payment_mode }).eq('id', payload.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  } else if (action === 'fee.delete') {
    const { error } = await supabase.from('fee_payments').delete().eq('id', payload.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  } else if (action === 'mess.create') {
    const { error } = await supabase.from('mess_subscriptions').insert(payload)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  } else if (action === 'notice.create') {
    const { data, error } = await supabase.from('notices').insert(payload).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } else if (action === 'notice.toggle') {
    const { data, error } = await supabase.from('notices').update({ is_published: payload.is_published }).eq('id', payload.id).select('id').maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
  } else if (action === 'notice.delete') {
    const { data, error } = await supabase.from('notices').delete().eq('id', payload.id).select('id').maybeSingle()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    if (!data) return NextResponse.json({ error: 'Notice not found' }, { status: 404 })
  } else if (action === 'student.create') {
    const { data, error } = await supabase.from('students').insert({
      ...payload,
      dob: payload.dob || null,
      admission_date: payload.admission_date || null,
    }).select('id, roll_number').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } else if (action === 'student.update') {
    const { id: studentId, email, ...updatePayload } = payload
    
    const { data: existing } = await supabase.from('students').select('admission_details').eq('id', studentId).single()
    const updatedDetails = {
      ...(existing?.admission_details as object || {}),
      email: email || '',
      firstName: updatePayload.name?.split(' ')[0] || '',
      lastName: updatePayload.name?.split(' ').pop() || '',
      address: updatePayload.address,
      studentPhone: updatePayload.phone,
      parentPhone: updatePayload.parent_phone,
      aadhaar: updatePayload.aadhaar_no,
      guaranteeNo: updatePayload.guarantee_letter_no,
      dob: updatePayload.dob,
      age: updatePayload.age ? String(updatePayload.age) : '',
      height: updatePayload.height ? String(updatePayload.height) : '',
      weight: updatePayload.weight ? String(updatePayload.weight) : '',
      chest: updatePayload.chest ? String(updatePayload.chest) : '',
      gender: updatePayload.gender,
      courses: [updatePayload.course],
      admissionDate: updatePayload.admission_date,
      durationMonths: updatePayload.duration,
      totalFee: String(updatePayload.total_fee),
    }

    const { data, error } = await supabase.from('students').update({
      ...updatePayload,
      dob: updatePayload.dob || null,
      admission_date: updatePayload.admission_date || null,
      admission_details: updatedDetails
    }).eq('id', studentId).select('id, roll_number').single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    
    const oldEmail = (existing?.admission_details as any)?.email
    if (email && email !== oldEmail) {
      await sendTransactionalEmail({
        to: email,
        subject: 'तुमची माहिती शिवरक्षक करिअर अकॅडमीमध्ये अपडेट झाली आहे',
        html: `<h2>शिवरक्षक करिअर अकॅडमी</h2><p>नमस्कार ${updatePayload.name}, तुमची माहिती (Email सोबत) सिस्टीममध्ये यशस्वीरित्या अपडेट करण्यात आली आहे.</p><p>काही अडचण असल्यास कृपया संपर्क साधा.</p>`,
      })
    }
    
    return NextResponse.json({ data })
  } else if (action === 'media.create') {
    if (payload.placement.startsWith('demo-')) {
      if (payload.media_type === 'image' || !payload.thumbnail_url) {
        return NextResponse.json({ error: 'Demo video आणि त्याचा poster photo आवश्यक आहे.' }, { status: 400 })
      }
      const { error: replaceError } = await supabase.from('media_assets').delete().eq('placement', payload.placement)
      if (replaceError) return NextResponse.json({ error: replaceError.message }, { status: 400 })
    }
    const { data, error } = await supabase.from('media_assets').insert({ ...payload, thumbnail_url: payload.thumbnail_url || null }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } else if (action === 'media.delete') {
    const { error } = await supabase.from('media_assets').delete().eq('id', payload.id)
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  } else if (action === 'settings.update') {
    const { error } = await supabase.from('site_settings').upsert({ id: 1, ...payload })
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  } else if (action === 'attendance.session.create') {
    const { data, error } = await supabase.from('attendance_sessions').insert(payload).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } else if (action === 'attendance.mark') {
    const { data, error } = await supabase.from('attendance_records').upsert(payload, { onConflict: 'session_id,student_id' }).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  } else if (action === 'exam.create') {
    const { data, error } = await supabase.from('exams').insert(payload).select().single()
    if (error) return NextResponse.json({ error: error.message }, { status: 400 })
    return NextResponse.json({ data })
  }

  return NextResponse.json({ ok: true })
}
