import React from 'react'
import Page, { getServerSideProps, PageProps } from './page/[page]'
// import CompState from "@/components/test/state";

export { getServerSideProps }

const Index: React.FC<PageProps> = ({ list }) => {
  return (
    <Page list={list}/>
  )
}

export default Index
