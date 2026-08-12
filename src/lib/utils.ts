import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, differenceInDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatDate(date: string | Date) {
  return format(new Date(date), 'dd/MM/yyyy')
}

export function daysUntil(date: string | Date) {
  return differenceInDays(new Date(date), new Date())
}

export const COURSES: Record<string, string> = {
  police: 'पोलीस',
  navy: 'नेव्ही',
  mpsc: 'एम.पी.एस.सी',
  staff_selection: 'स्टॉफ सिलेक्शन',
  saral_seva: 'सरळ सेवा',
  army: 'आर्मी',
  railway: 'रेल्वे',
  other: 'इतर',
}

export const DOC_TYPES: Record<string, string> = {
  photo: '📷 फोटो',
  aadhaar: '🪪 आधार कार्ड',
  school_leaving: '📄 शाळा सोडल्याचा दाखला',
  caste: '📜 जात प्रमाणपत्र',
  parent_aadhaar: '🪪 पालकाचे आधार कार्ड',
  signature: '✍️ सही',
  aadhaar_front: '🪪 आधार (समोर)',
  aadhaar_back: '🪪 आधार (मागे)',
  marksheet_10: '📄 10वी मार्कशीट',
  marksheet_12: '📄 12वी मार्कशीट',
  caste_certificate: '📜 जातीचा दाखला',
  domicile: '📋 अधिवास दाखला',
  sports_certificate: '🏅 क्रीडा प्रमाणपत्र',
  other: '📎 इतर',
}

export function generateRollNumber() {
  const year = new Date().getFullYear().toString().slice(2)
  const random = Math.floor(Math.random() * 9000) + 1000
  return `SKA${year}${random}`
}

