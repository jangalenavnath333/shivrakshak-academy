import { requireAdmin } from '@/lib/admin-auth'

export default async function SetupLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return children
}
