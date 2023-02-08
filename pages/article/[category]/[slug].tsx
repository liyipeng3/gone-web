// import { useRouter } from 'next/router'
import React from 'react'
import Sidebar from '@components/common/sidebar'
import marked from '@utils/marked'
import Prose from '@components/common/prose'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface ContentProps {
  title: string
  content: string
}

export async function getServerSideProps (context: { params: { slug: any } }) {
  const data = await prisma.contents.findUnique({
    where: {
      slug: context.params.slug
    },
    select: {
      title: true,
      text: true
    }
  })
  if (data === null) {
    return {
      notFound: true
    }
  }

  const content = marked.parse(data.text ?? '')
  return {
    props: {
      title: data.title,
      content
    } // will be passed to the page component as props
  }
}

const Content: React.FC<ContentProps> = ({
  title,
  content
}) => {
  // const router = useRouter()
  // const {
  //   category,
  //   id
  // } = router.query

  return (
    <div className="flex justify-center items-start min-h-full flex-1 py-6 px-32">
      <article className="prose max-w-none text-left flex-1 py-6 ">
        <h2 className="mb-10 dark:text-white">{title}</h2>
        <Prose content={content}/>
      </article>
      <Sidebar/>
    </div>
  )
}

export default Content
