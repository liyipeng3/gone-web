import React from 'react'
import { redirect } from 'next/navigation'

import Profile from './client'
import { authOptions } from '@/lib/auth'
import { getCurrentUser } from '@/lib/session'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import prisma from '@/lib/prisma'

export const metadata = {
  title: '个人资料',
  description: '管理您的个人资料信息。'
}

export default async function ProfilePage () {
  const user = await getCurrentUser()

  const userInfo = await prisma.users.findUnique({
    where: {
      uid: parseInt(user?.id ?? '0')
    },
    select: {
      uid: true,
      username: true,
      email: true,
      url: true,
      nickname: true
    }
  })

  if (!user) {
    redirect(authOptions?.pages?.signIn ?? '/login')
  }

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Profile"
        text="Manage your personal information."
      />
      <Profile user={userInfo} />
    </DashboardShell>
  )
}
