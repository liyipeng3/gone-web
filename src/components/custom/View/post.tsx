'use client'
import type React from 'react'
import { useEffect } from 'react'

interface PostViewProps {
  cid: number
}
const PostView: React.FC<PostViewProps> = ({ cid }) => {
  useEffect(() => {
    void fetch('/api/post/v/' + cid).then(() => {})
  }, [cid])

  return null
}

export default PostView
