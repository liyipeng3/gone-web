import List from '@/components/custom/List'
import React from 'react'

const Search: React.FC<{
  searchParams?: Record<string, string | string[] | undefined>
}> = ({ searchParams }) => {
  return <List searchParams={searchParams}/>
}

export default Search
