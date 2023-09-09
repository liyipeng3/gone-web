// export { getServerSideProps } from '../page/[num]'
import Page from '@/app/(blog)/page/[num]/page'
import React from 'react'
import { type NextPageProps } from '@/types'

const Search: React.FC<NextPageProps> = (props) => {
  return (
        <Page {...props} />
  )
}
export default Search
