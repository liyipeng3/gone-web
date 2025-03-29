import { CardSkeleton } from '@/components/dashboard/card-skeleton'
import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'

export default function DashboardProfileLoading () {
  return (
    <DashboardShell>
      <DashboardHeader
        heading="Profile"
        text="Manage your personal information."
      />
      <div className="grid gap-10">
        <CardSkeleton/>
      </div>
    </DashboardShell>
  )
}
