'use client'

import { ReactNode } from 'react'
import { AdminRouteGate } from '@/components/admin-auth'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminRouteGate>{children}</AdminRouteGate>
}
