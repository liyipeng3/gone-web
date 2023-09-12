import { type DashboardConfig } from 'types'

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: 'Site',
      href: '/'
    },
    {
      title: 'Support',
      href: '/support',
      disabled: true
    }
  ],
  sidebarNav: [
    {
      title: 'Posts',
      href: '/dashboard',
      icon: 'post'
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: 'settings'
    }
  ]
}
