import { requireAdmin } from '@/lib/admin-auth'
import AdminShell from './AdminShell'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return <AdminShell>{children}</AdminShell>
}
