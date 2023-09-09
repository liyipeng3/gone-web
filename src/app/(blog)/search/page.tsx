// export { getServerSideProps } from '../page/[num]'
import Page, { type PageProps } from '@/app/(blog)/page/[num]/page'
import React from 'react'

const Search: React.FC<PageProps> = (props) => {
  return (
        <Page {...props} />
  )
}
export default Search
