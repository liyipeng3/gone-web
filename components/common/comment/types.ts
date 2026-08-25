import { type User } from 'next-auth'

// 评论区共享类型

// 登录用户（与 next-auth session.user 对齐：User + 稳定 id）
export type CommentUser = User & { id: string }
