// import { useRouter } from 'next/router'
import React from 'react'
import db from '@/utils/db'
import { marked } from 'marked'
import prism from 'prismjs'

interface ContentProps {
  title: string
  content: string
}

export async function getServerSideProps (context: { params: { id: any } }) {
  const res = await db.query('select * from typecho_contents where cid = ?', [context.params.id])
  const data = res[0]

  marked.setOptions({
    highlight: function (code, lang) {
      return prism.highlight(code, prism.languages[lang], lang)
    }
  })

  const content = marked.parse(data.text)
  console.log(data)
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
    <div className="flex justify-center">
      <article className="prose text-left">
        <h2 className='m-8 text-center'>{title}</h2>
        <main dangerouslySetInnerHTML={{ __html: content }}></main>
      </article>
    </div>)
}

export default Content
