import { redirect } from 'next/navigation'

import { dashboardConfig } from '@/config/dashboard'
import { getCurrentUser } from '@/lib/session'
import { MainNav } from '@/components/dashboard/main-nav'
import { DashboardNav } from '@/components/dashboard/nav'
import { SiteFooter } from '@/components/dashboard/site-footer'
import { UserAccountNav } from '@/components/dashboard/user-account-nav'
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
    <div className="flex min-h-screen flex-col space-y-6">
      <header className="p-0 sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav items={dashboardConfig.mainNav}/>
          <UserAccountNav
            user={{
              name: user.name,
              image: user.image,
              email: user.email
            }}
          />
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav items={dashboardConfig.sidebarNav}/>
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">
          {children}
        </main>
      </div>
      <SiteFooter className="border-t"/>
    </div>
  )
}
