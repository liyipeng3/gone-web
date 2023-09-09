export type HotList = Array<{
  title: string
  category: string
  slug: string
}>

export interface NextPageProps {
  searchParams?: Record<string, string | string[] | undefined>
  params?: Record<string, string>
}
