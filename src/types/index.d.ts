import { type Icons } from '@/components/common/icons'

export type HotList = Array<{
  title: string
  category: string
  slug: string
}>

export interface NavItem {
  title: string
  href: string
  disabled?: boolean
}

export type MainNavItem = NavItem

export type SidebarNavItem = {
  title: string
  disabled?: boolean
  external?: boolean
  icon?: keyof typeof Icons
} & (
  | {
    href: string
    items?: never
  }
)

export interface SiteConfig {
  name: string
  description: string
  url: string
  ogImage: string
  links: {
    github: string
  }
}

export interface DocsConfig {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export interface MarketingConfig {
  mainNav: MainNavItem[]
}

export interface DashboardConfig {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export interface SubscriptionPlan {
  name: string
  description: string
  stripePriceId: string
}
