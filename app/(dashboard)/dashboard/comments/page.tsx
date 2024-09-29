import { DashboardHeader } from '@/components/dashboard/header'
import { DashboardShell } from '@/components/dashboard/shell'
import prisma from '@/lib/prisma'
import { getAvatarUrl } from '@/lib/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import dayjs from 'dayjs'

export default async function CommentsPage () {
  // prisma自定义联表查询 通过cid查询post
  // 在数据库中 comments 的cid没有配置外键关联posts
  // 当posts中可能没有comments里已有的cid时，添加关联的sql是
  // ALTER TABLE comments ADD FOREIGN KEY (cid) REFERENCES posts(cid);
  const comments = await prisma.comments.findMany({
    select: {
      coid: true,
      cid: true,
      created: true,
      author: true,
      mail: true,
      ip: true,
      text: true
    }
  })

  const posts = await prisma.relationships.findMany({
    include: {
      posts: {
        select: {
          title: true,
          slug: true,
          created: true,
          modified: true,
          text: true,
          viewsNum: true,
          likesNum: true
        }
      },
      metas: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    where: {
      metas: {
        type: 'category'
      }
    }
  })

  const commentsWithPost = comments.map(comment => {
    const post = posts.find(p => p.cid === comment.cid)
    return {
      ...comment,
      post: { ...post, ...post?.posts, category: post?.metas?.slug }
    }
  })

  return <DashboardShell>
        <DashboardHeader heading="Comments" text="Manage comments.">
        </DashboardHeader>
        <div className="overflow-x-auto">
            <table className="w-full border-collapse  border-solid border-gray-300">
                <thead className=" text-nowrap">
                    <tr>
                        <th className="px-4 py-2 text-left"></th>
                        <th className="px-4 py-2 text-left">作者</th>
                        <th className="px-4 py-2 text-left">内容</th>
                    </tr>
                </thead>
                <tbody>
                    {commentsWithPost.map((comment) => (
                        <tr key={comment.coid} className="border-t border-gray-300 hover:bg-gray-50 group">
                            <td className="px-4 py-2"><Checkbox /></td>
                            <td className="px-4 py-2">
                                <div className="flex items-center">
                                    <img src={getAvatarUrl(comment.mail ?? '')} alt={`${comment.author}的头像`} className="w-10 h-10 rounded-full object-cover" />
                                    <div className="ml-2">
                                        <div className="text-sm font-semibold">{comment.author}</div>
                                        <a className="text-xs text-gray-500" href={`mailto:${comment.mail}`}>{comment.mail}</a>
                                        <div className="text-xs text-gray-500 ">{comment.ip}</div>
                                    </div>
                                </div>
                            </td>
                            <td className="px-4 py-2">

                                <div className="text-sm gap-2 flex flex-col">
                                    <div className="text-xs text-gray-500">
                                        {dayjs((comment.created ?? 0) * 1000).format('YYYY年MM月DD日')}于 <a target="_blank" href={`/post/${comment.post?.category}/${comment.post?.slug}`} className="text-blue-600 hover:underline">{comment.post?.title ?? '未知'}</a>
                                        </div>
                                    <div className="">
                                        {comment.text}
                                    </div>
                                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="text-xs text-green-600 hover:cursor-pointer">通过</div>
                                        <div className="text-xs text-gray-400">待审核</div>
                                        <div className="text-xs text-red-600 hover:cursor-pointer">垃圾</div>
                                        <div className="text-xs text-blue-600 hover:cursor-pointer">编辑</div>
                                        <div className="text-xs text-red-600 hover:cursor-pointer">删除</div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </DashboardShell>
}
