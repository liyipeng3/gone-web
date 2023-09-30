// export { getServerSideProps } from '../page/[num]'
import Page from '@/app/(web)/page/[num]/page'
import React from 'react'

const Search: React.FC<any> = (props) => {
  return (
    <Page {...props} />
  )
}
export default Search
