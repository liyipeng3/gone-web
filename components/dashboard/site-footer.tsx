import * as React from 'react'
import { cn } from '@/lib/utils'
import { Icons } from '@/components/common/icons'

export function SiteFooter ({ className }: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer className={cn(className, 'p-0')}>
      <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-20 md:flex-row md:py-0">
        <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
          <Icons.logo/>
        </div>
        {/* <ModeToggle/> */}
      </div>
    </footer>
  )
}
