export interface Student {
  id: string
  roll_number: string
  name: string
  parent_name: string
  address: string
  phone: string
  parent_phone: string
  aadhaar_no: string
  guarantee_letter_no: string
  dob: string
  course: string
  admission_date: string
  duration: string
  age: number
  height: number
  weight: number
  chest: number
  gender: 'male' | 'female'
  total_fee: number
  photo_url?: string
  created_at: string
}

export interface FeePayment {
  id: string
  student_id: string
  amount_paid: number
  payment_date: string
  payment_mode: 'cash' | 'upi' | 'bank_transfer' | 'cheque'
  receipt_no?: string
  notes?: string
  created_at: string
}

export interface StudentFeeSummary {
  id: string
  name: string
  roll_number: string
  parent_phone: string
  course: string
  total_fee: number
  total_paid: number
  pending_amount: number
}

export interface Document {
  id: string
  student_id: string
  doc_type: string
  file_url: string
  file_name: string
  uploaded_at: string
}

export interface MessSubscription {
  id: string
  student_id: string
  start_date: string
  end_date: string
  amount: number
  is_active: boolean
  reminder_sent: boolean
  created_at: string
  student_name?: string
  student_phone?: string
  parent_phone?: string
}

export interface Notice {
  id: string
  title: string
  content: string
  category: 'general' | 'exam' | 'result' | 'holiday' | 'important'
  attachment_url?: string
  is_published: boolean
  created_at: string
}

export interface SiteSettings {
  id: number
  academy_name: string
  tagline?: string
  hero_title?: string
  hero_subtitle?: string
  phone?: string
  whatsapp?: string
  email?: string
  address?: string
  youtube_url?: string
  instagram_url?: string
  facebook_url?: string
}

export interface MediaAsset {
  id: string
  title: string
  media_type: 'image' | 'video' | 'youtube'
  placement: string
  url: string
  thumbnail_url?: string
  alt_text?: string
  sort_order: number
  is_published: boolean
}

export interface Course {
  id: string
  title: string
  slug: string
  description?: string
  image_url?: string
  duration?: string
  is_published: boolean
  sort_order: number
}
