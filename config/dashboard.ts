import { type DashboardConfig } from '@/types'

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: 'Site',
      href: '/',
      external: true
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
      title: 'Gallery',
      href: '/dashboard/gallery',
      icon: 'image'
    },
    {
      title: 'Comments',
      href: '/dashboard/comments',
      icon: 'comment'
    },
    {
      title: 'About',
      href: '/dashboard/about',
      icon: 'page'
    },
    {
      title: 'Profile',
      href: '/dashboard/profile',
      icon: 'user'
    },
    {
      title: 'Settings',
      href: '/dashboard/settings',
      icon: 'settings'
    }
  ]
}
