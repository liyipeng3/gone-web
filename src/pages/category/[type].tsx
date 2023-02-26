import { type GetServerSideProps } from 'next'
import { getHotList, getPostList } from '@/models/content'
import { pageSize } from '@/utils/constants'
import Page from '@/pages/page/[num]'
import prisma from '@/utils/prisma'

export const getServerSideProps: GetServerSideProps = async (context) => {
  const pageNum: number = (context.query?.page as unknown as number) ?? 1
  const category: string = (context.params?.type as unknown as string)
  if (category === '') {
    return {
      notFound: true
    }
  }
  const categoryData = await prisma.metas.findMany({
    where: {
      slug: category
    },
    select: {
      name: true,
      mid: true
    }
  })
  if (categoryData.length !== 1) {
    return {
      notFound: true
    }
  }

  const {
    list,
    total
  } = await getPostList({
    pageNum,
    pageSize,
    mid: categoryData[0].mid
  })
  if (list.length === 0) {
    return {
      notFound: true
    }
  }
  const hotList = await getHotList()
  const description = `分类 ${categoryData[0].name as string} 下的文章列表`

  return {
    props: {
      list,
      total,
      hotList,
      description,
      baseLink: `/category/${category}/?page=`
    }
  }
}

// const Category: React.FC = () => {
//   return <div>Category</div>
// }

export default Page
