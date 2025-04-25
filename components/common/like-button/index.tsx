'use client'

import React from 'react'
import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

// 动态导入点赞按钮组件
const LikeButtonComponent = dynamic(async () => await import('./Button'), {
  loading: () => <div className="flex justify-center items-center h-10 w-24"><Loader2 className="h-4 w-4 animate-spin" /></div>,
  ssr: false // 点赞功能不需要 SEO，可以禁用服务端渲染
})

interface LikeButtonProps {
  cid: number
  initialLikes?: number
}

// 客户端包装组件
const LikeButton: React.FC<LikeButtonProps> = ({ cid, initialLikes = 0 }) => {
  return (
    <LikeButtonComponent cid={cid} initialLikes={initialLikes} />
  )
}

export default LikeButton
