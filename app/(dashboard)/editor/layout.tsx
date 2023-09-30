import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
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

    <div className="container flex-1 gap-12 ">
      <main className="flex w-full flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>

  )
}
