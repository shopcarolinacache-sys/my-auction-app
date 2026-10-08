import type { Metadata } from 'next'
import { AdminDashboard } from '@/components/admin-dashboard'

export const metadata: Metadata = {
  title: 'Admin Studio',
  description: 'Carolina Cache inventory and auction management dashboard.',
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  return <AdminDashboard />
}
