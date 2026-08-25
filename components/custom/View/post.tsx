'use client'
import type React from 'react'
import { useEffect } from 'react'
import http from '@/lib/http'

interface PostViewProps {
  cid: number
}

const PostView: React.FC<PostViewProps> = ({ cid }) => {
  useEffect(() => {
    void http.get(`/api/post/v/${cid}`).catch(() => {})
  }, [cid])

  return null
}

export default PostView
