'use client'
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { miniToast } from '@/components/ui/mini-toast'

interface LikeButtonProps {
  cid: number
  initialLikes?: number
}

const LikeButton: React.FC<LikeButtonProps> = ({ cid, initialLikes = 0 }) => {
  const [likes, setLikes] = useState<number>(initialLikes)
  const [isLiked, setIsLiked] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const animationRef = useRef<boolean>(false)

  useEffect(() => {
    // 从 localStorage 检查用户是否已经点赞过这篇文章
    const likedPosts = JSON.parse(localStorage.getItem('like-posts') ?? '{}')
    setIsLiked(!!likedPosts[cid])

    // 如果没有初始点赞数，则从 API 获取
    if (initialLikes === 0) {
      void fetchLikes()
    }
  }, [cid, initialLikes])

  const fetchLikes = async () => {
    try {
      const response = await fetch(`/api/post/like/${cid}`)
      if (response.ok) {
        const data = await response.json()
        setLikes(data.likesNum || 0)
      }
    } catch (error) {
      console.error('获取点赞数失败:', error)
    }
  }

  const handleLike = async () => {
    if (isLoading) return

    if (isLiked) {
      miniToast.show('诶赞过啦~', { position: 'center' })
      return
    }

    setIsLoading(true)
    // 立即更新UI，不等待服务器响应
    setLikes(prevLikes => prevLikes + 1)
    setIsLiked(true)

    // 触发一次新的动画
    if (!animationRef.current) {
      animationRef.current = true
      // 1.5秒后重置动画状态
      setTimeout(() => {
        animationRef.current = false
      }, 1500)
    }

    // 保存点赞状态到 localStorage
    const likedPosts = JSON.parse(localStorage.getItem('like-posts') ?? '{}')
    likedPosts[cid] = true
    localStorage.setItem('like-posts', JSON.stringify(likedPosts))

    // 显示小型 toast 提示
    miniToast.show('感谢支持~', { position: 'center' })

    try {
      // 后台发送请求到服务器
      await fetch(`/api/post/like/${cid}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      // 不再等待响应更新UI
    } catch (error) {
      console.error('点赞请求失败:', error)
      // 请求失败时不回滚UI，保持良好的用户体验
    } finally {
      setIsLoading(false)
    }
  }

  // 粒子效果组件 - 使用key确保组件只渲染一次
  const HeartParticles = useMemo(() => {
    // 预定义粒子的位置和动画参数
    const particles = [
      { x: 30, y: -40, rotate: 15 },
      { x: -30, y: -40, rotate: -15 },
      { x: 60, y: -20, rotate: 30 },
      { x: -60, y: -20, rotate: -30 },
      { x: 40, y: 30, rotate: 45 },
      { x: -40, y: 30, rotate: -45 },
      { x: 10, y: 50, rotate: 10 },
      { x: -10, y: 50, rotate: -10 }
    ]

    return (
      <div className="absolute inset-0 pointer-events-none" >
        {animationRef.current && particles.map((particle, i) => (
          <motion.div
            key={i}
            className="absolute left-1/2 top-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: [0, 1, 0],
              x: [0, particle.x],
              y: [0, particle.y],
              rotate: [0, particle.rotate],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 1.2,
              ease: 'easeOut',
              times: [0, 0.3, 1]
            }}
          >
            <Heart className="h-3 w-3 text-pink-500 fill-pink-500"/>
          </motion.div>
        ))}
      </div>
    )
  }, [animationRef.current])

  return (
    <div className="relative">
      <motion.div
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.05 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <Button
          variant={isLiked ? 'default' : 'outline'}
          size="lg"
          className={
            'flex items-center gap-2 px-6 py-5 rounded-full transition-all ' +
            (isLiked
              ? 'bg-pink-100 hover:bg-pink-200 text-pink-600 dark:bg-pink-950 dark:hover:bg-pink-900 dark:text-pink-400'
              : 'hover:text-pink-600 dark:hover:text-pink-400')
          }
          onClick={handleLike}
          disabled={isLoading}
          aria-label="点赞文章"
        >
          <Heart
            className={
              'h-5 w-5 ' +
              (isLiked
                ? 'fill-pink-600 text-pink-600 dark:fill-pink-400 dark:text-pink-400'
                : '')
            }
          />
          <span className="text-base font-medium">{likes}</span>
        </Button>
      </motion.div>
      {HeartParticles}
    </div>
  )
}

export default LikeButton
