'use client'
import type React from 'react'
import { useEffect } from 'react'

interface ClientProps {
  cid: number
}
const PostView: React.FC<ClientProps> = ({ cid }) => {
  useEffect(() => {
    void fetch('/api/post/v/' + cid).then(() => {})
  }, [])

  return null
}

export default PostView
