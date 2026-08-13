import { requireAdmin } from '@/lib/admin-auth'
import AdminShell from './AdminShell'
import '../admin.css'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()
  return <AdminShell>{children}</AdminShell>
}
