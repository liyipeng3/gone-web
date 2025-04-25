import { redirect } from 'next/navigation'

import { dashboardConfig } from '@/config/dashboard'
import { getCurrentUser } from '@/lib/session'
import { MainNav } from '@/components/dashboard/main-nav'
import { SiteFooter } from '@/components/dashboard/site-footer'
import { UserAccountNav } from '@/components/dashboard/user-account-nav'
import { ModeToggle } from '@/components/dashboard/mode-toggle'
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
      <header className="p-0 top-0 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <MainNav items={dashboardConfig.mainNav}/>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserAccountNav
              user={{
                name: user?.name,
                image: user?.image,
                email: user?.email
              }}
            />
          </div>
        </div>
      </header>
      {children}
      <SiteFooter className="border-t"/>
    </div>
  )
}
