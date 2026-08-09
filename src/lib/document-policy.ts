export const DOCUMENT_TYPES = [
  'photo', 'signature', 'aadhaar_front', 'aadhaar_back', 'marksheet_10',
  'marksheet_12', 'caste_certificate', 'domicile', 'sports_certificate', 'other',
  'aadhaar', 'school_leaving', 'caste', 'parent_aadhaar',
] as const

export const DOCUMENT_TYPE_SET = new Set<string>(DOCUMENT_TYPES)
export const DOCUMENT_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'] as const
export const DOCUMENT_MIME_TYPE_SET = new Set<string>(DOCUMENT_MIME_TYPES)
export const MAX_DOCUMENT_BYTES = 10 * 1024 * 1024
export const MAX_ADMISSION_DOCUMENT_BYTES = 50 * 1024 * 1024

export function documentStoragePath(value: string) {
  const marker = '/storage/v1/object/public/student-documents/'
  const path = value.includes(marker) ? value.split(marker)[1] : value
  return decodeURIComponent(path.split('?')[0])
}

