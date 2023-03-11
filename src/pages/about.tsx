import React from 'react'
import { type GetServerSideProps } from 'next'
import { getHotList, getPost } from '@/models/content'
import marked from '@/utils/marked'
import Main from '@/components/layout/main'
import Head from 'next/head'
import Breadcrumb from '@/components/common/breadcrumb'
import Prose from '@/components/common/prose'
import { type HotList } from '@/types'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const slug: string = 'about'
  const post = await getPost(slug)
  if (post === null) {
    return {
      notFound: true
    }
  }
  const content = marked.parse(post.text ?? '')
  const hotList = await getHotList()

  return {
    props: {
      title: post.title,
      content,
      created: post.created,
      hotList
    }
  }
}

interface ContentProps {
  title: string
  content: string
  name: string
  hotList: HotList
}

const About: React.FC<ContentProps> = ({
  title,
  content,
  name,
  hotList
}) => {
  return (
    <Main hotList={hotList}>
      <Head>
        <title>{`${title} - lyp123`}</title>
      </Head>
      <article className="md:max-w-3xl max-w-full text-left flex-1 prose w-screen lg:w-[48rem] md:w-[36rem]">
        <Breadcrumb items={[{
          name: '关于',
          href: '/about'
        }]}/>
        <h2 className="md:mb-2 mt-4 dark:text-white">{title}</h2>
        <Prose content={content}/>
      </article>
    </Main>
  )
}

export default About
