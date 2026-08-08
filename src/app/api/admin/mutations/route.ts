import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminUser } from '@/lib/admin-auth'
import { createSupabaseServerClient } from '@/lib/supabase-server'

const id = z.string().uuid()
const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('fee.create'), payload: z.object({ student_id: id, amount_paid: z.number().positive().max(10_000_000), payment_date: z.string().date(), payment_mode: z.enum(['cash', 'upi', 'bank_transfer', 'cheque']) }) }),
  z.object({ action: z.literal('mess.create'), payload: z.object({ student_id: id, start_date: z.string().date(), end_date: z.string().date(), amount: z.number().min(0).max(10_000_000) }).refine((value) => value.end_date >= value.start_date, 'End date must not be before start date') }),
  z.object({ action: z.literal('notice.create'), payload: z.object({ title: z.string().trim().min(2).max(200), content: z.string().trim().max(5000), category: z.enum(['general', 'exam', 'result', 'holiday', 'important']), is_published: z.boolean() }) }),
  z.object({ action: z.literal('notice.toggle'), payload: z.object({ id, is_published: z.boolean() }) }),
  z.object({ action: z.literal('notice.delete'), payload: z.object({ id }) }),
  z.object({ action: z.literal('student.create'), payload: z.object({
    name: z.string().trim().min(2).max(120), parent_name: z.string().trim().max(120), address: z.string().trim().max(500),
    phone: z.string().trim().max(15), parent_phone: z.string().trim().max(15), aadhaar_no: z.string().trim().max(20),
    guarantee_letter_no: z.string().trim().max(80), dob: z.string(), course: z.enum(['police', 'navy', 'mpsc', 'staff_selection', 'saral_seva', 'army', 'railway', 'other']),
    admission_date: z.string(), duration: z.string().trim().max(80), age: z.number().int().nullable(), height: z.number().nullable(),
    weight: z.number().nullable(), chest: z.number().nullable(), gender: z.enum(['male', 'female']), total_fee: z.number().min(0).max(10_000_000),
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
  }

  return NextResponse.json({ ok: true })
}
