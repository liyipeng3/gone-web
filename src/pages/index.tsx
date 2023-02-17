import React from 'react'
import Page, { getServerSideProps, type PageProps } from './page/[num]'
// import CompState from "@/components/test/state";

export { getServerSideProps }

const Index: React.FC<PageProps> = ({
  list,
  total
}) => {
  return (
    <Page list={list} total={total}/>
  )
}

export default Index
