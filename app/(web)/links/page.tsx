import Breadcrumb from '@/components/common/breadcrumb'
import CommentList from '@/components/common/comment'
import Prose from '@/components/common/prose'
import { getPagePost } from '@/services/post'
import { getLinks } from '@/models/links'
import LinkImage from '@/components/custom/LinkImage'

export const metadata = {
  title: '邻居',
  description: '互联网上的邻居们'
}

const Guestbook = async () => {
  const {
    content,
    cid
  } = await getPagePost('links')

  const links = await getLinks()

  return <div className='md:max-w-3xl max-w-full text-left flex-1 w-screen lg:w-[48rem] md:w-[36rem] mx-auto px-4 pb-10 pt-3'>
    <Breadcrumb items={[{
      name: '邻居',
      href: '/links'
    }]}/>
    <h2 className="md:mb-2 mt-4 dark:text-white text-xl font-bold">邻居</h2>
    <Prose content={content} />
    <div className='grid grid-cols-2 gap-4'>
      {links?.map((link) => (
        <a
          href={link.url ?? ''}
          key={link.lid}
          target='_blank'
          rel='noreferrer'
          className='flex items-center gap-2 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 border border-gray-200 dark:border-gray-700'
        >
          <LinkImage url={link.url ?? ''} name={link.name ?? ''} />
          <span className="font-medium text-gray-800 dark:text-gray-200">{link.name}</span>
        </a>
      ))}
    </div>
    <div className='w-full h-[1px] bg-gray-200 my-8 mb-4' />
    <CommentList cid={cid} title='邻居' />
  </div>
}

export default Guestbook
