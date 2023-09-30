import { redirect } from 'next/navigation'

import { dashboardConfig } from '@/config/dashboard'
import { getCurrentUser } from '@/lib/session'
import { DashboardNav } from '@/components/dashboard/nav'
import React from 'react'
import { authOptions } from '@/lib/auth'

interface DashboardLayoutProps {
  children?: React.ReactNode
}

export default async function DashboardLayout ({
  children
}: DashboardLayoutProps) {
  const user = await getCurrentUser()

  if (user == null) {
    redirect(authOptions?.pages?.signIn ?? '/login')
  }

  return (

    <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
      <aside className="hidden w-[200px] flex-col md:flex">
        <DashboardNav items={dashboardConfig.sidebarNav}/>
      </aside>
      <main className="flex w-full flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>

  )
}
