import React from 'react'
import Page, { getServerSideProps, type PageProps } from './page/[num]'
// import CompState from "@/components/test/state";

export { getServerSideProps }

const Index: React.FC<PageProps> = ({
  list,
  total,
  hotList
}) => {
  return (
    <Page list={list} total={total} hotList={hotList}/>
  )
}

export default Index
