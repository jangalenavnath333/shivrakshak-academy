import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createPublicSiteClient } from '@/lib/public-site-supabase'

const enquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().regex(/^\d{10}$/),
  email: z.string().trim().email().max(160).optional().or(z.literal('')),
  course: z.string().trim().max(80).optional().default(''),
  message: z.string().trim().max(800).optional().default(''),
  website: z.string().max(0).optional().default(''),
})

export async function POST(request: Request) {
  try {
    const parsed = enquirySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'कृपया नाव आणि 10 अंकी मोबाईल नंबर योग्य भरा.' }, { status: 400 })
    }

    const { website: _honeypot, ...enquiry } = parsed.data
    const supabase = createPublicSiteClient()
    const { error } = await supabase.from('enquiries').insert({
      ...enquiry,
      email: enquiry.email || null,
      course: enquiry.course || null,
      message: enquiry.message || null,
    })

    if (error) {
      console.error('Enquiry insert failed', error.code)
      return NextResponse.json({ error: 'चौकशी जतन झाली नाही. कृपया WhatsApp किंवा फोन करा.' }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'विनंती पूर्ण झाली नाही. पुन्हा प्रयत्न करा.' }, { status: 400 })
  }
}

