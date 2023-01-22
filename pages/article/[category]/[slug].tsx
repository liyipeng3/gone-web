// import { useRouter } from 'next/router'
import React from 'react'
import db from '@utils/db'
import { marked } from 'marked'
import highlight from 'highlight.js'

interface ContentProps {
  title: string
  content: string
}

export async function getServerSideProps (context: { params: { slug: any } }) {
  const res = await db.query('select * from contents where slug = ?', [context.params.slug])
  const data = res?.[0]

  marked.setOptions({
    highlight: function (code, lang) {
      const language = (highlight.getLanguage(lang) != null) ? lang : 'plaintext'
      return highlight.highlightAuto(code, [language]).value
    }
  })

  const content = marked.parse(data.text)
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
    <div className="flex justify-center items-start min-h-full flex-1">
      <article className="prose text-left">
        <h2 className='my-10'>{title}</h2>
        <main dangerouslySetInnerHTML={{ __html: content }}></main>
      </article>
    </div>)
}

export default Content
