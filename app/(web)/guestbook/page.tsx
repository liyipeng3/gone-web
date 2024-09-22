import Breadcrumb from '@/components/common/breadcrumb'
import CommentList from '@/components/common/comment'

export const metadata = {
  title: '留言',
  description: '来都来了，留个言再走呗'
}

const Guestbook = () => {
  return <div className='md:max-w-3xl max-w-full text-left flex-1 w-screen lg:w-[48rem] md:w-[36rem] mx-auto px-4'>
    <Breadcrumb items={[{
      name: '留言',
      href: '/guestbook'
    }]}/>
    <h2 className="md:mb-2 mt-4 dark:text-white text-xl font-bold">留言</h2>
    <div className='text-left text-sm  my-8'>来都来了，留个言再走呗</div>
    <div className='w-full h-[1px] bg-gray-200 my-8 mb-4' />
    <CommentList cid={23} title='留言' />
  </div>
}

export default Guestbook
