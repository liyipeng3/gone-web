'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { ArrowUp, Music, Pause, List } from 'lucide-react'
import { usePathname } from 'next/navigation'

interface ChapterItem {
  id: string
  title: string
  level: number
}

const musicList = [
  'https://music.163.com/song/media/outer/url?id=28481105.mp3',
  'https://music.163.com/song/media/outer/url?id=486999661.mp3',
  'https://music.163.com/song/media/outer/url?id=1293886117.mp3',
  'https://music.163.com/song/media/outer/url?id=507795470.mp3',
  'https://music.163.com/song/media/outer/url?id=1313354324.mp3',
  'https://music.163.com/song/media/outer/url?id=651387737.mp3',
  'https://music.163.com/song/media/outer/url?id=533259686.mp3',
  'https://music.163.com/song/media/outer/url?id=30431367.mp3',
  'https://music.163.com/song/media/outer/url?id=35476049.mp3',
  'https://music.163.com/song/media/outer/url?id=408814900.mp3',
  'https://music.163.com/song/media/outer/url?id=417250673.mp3',
  'https://music.163.com/song/media/outer/url?id=438801672.mp3',
  'https://music.163.com/song/media/outer/url?id=30903117.mp3',
  'https://music.163.com/song/media/outer/url?id=108251.mp3',
  'https://music.163.com/song/media/outer/url?id=31445772.mp3',
  'https://music.163.com/song/media/outer/url?id=562594191.mp3',
  'https://music.163.com/song/media/outer/url?id=25638273.mp3',
  'https://music.163.com/song/media/outer/url?id=543607345.mp3',
  'https://music.163.com/song/media/outer/url?id=1330348068.mp3',
  'https://music.163.com/song/media/outer/url?id=480768067.mp3',
  'https://music.163.com/song/media/outer/url?id=462523414.mp3',
  'https://music.163.com/song/media/outer/url?id=464674509.mp3',
  'https://music.163.com/song/media/outer/url?id=406000625.mp3',
  'https://music.163.com/song/media/outer/url?id=569214126.mp3',
  'https://music.163.com/song/media/outer/url?id=175072.mp3',
  'https://music.163.com/song/media/outer/url?id=410801653.mp3',
  'https://music.163.com/song/media/outer/url?id=28285910.mp3',
  'https://music.163.com/song/media/outer/url?id=364877.mp3'
]

const FloatingButtons: React.FC = () => {
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1)
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [chapters, setChapters] = useState<ChapterItem[]>([])
  const [activeChapter, setActiveChapter] = useState<string>('')
  const [showChapters, setShowChapters] = useState(false)
  const pathname = usePathname()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [progressPercentage, setProgressPercentage] = useState(0)

  // 获取随机音乐索引
  const getRandomTrackIndex = () => {
    const randomIndex = Math.floor(Math.random() * musicList.length)
    return randomIndex
  }

  // 初始化音频播放器
  useEffect(() => {
    // 如果已经有音频实例，不重新创建
    if (audioRef.current) return

    const audioElement = new Audio()
    audioElement.addEventListener('ended', playNextTrack)
    audioElement.addEventListener('timeupdate', updateProgress)
    audioElement.addEventListener('loadedmetadata', () => {
      setDuration(audioElement.duration)
    })
    audioElement.addEventListener('error', (e) => {
      console.error('音频加载错误:', e)
      playNextTrack() // 如果当前音频加载失败，尝试播放下一首
    })

    setAudio(audioElement)
    audioRef.current = audioElement

    // 选择一个随机的初始曲目
    const initialTrackIndex = getRandomTrackIndex()
    setCurrentTrackIndex(initialTrackIndex)
    audioElement.src = musicList[initialTrackIndex]
    // 预加载音频
    audioElement.load()

    return () => {
      if (audioElement) {
        audioElement.removeEventListener('ended', playNextTrack)
        audioElement.removeEventListener('timeupdate', updateProgress)
        audioElement.removeEventListener('error', playNextTrack)
        audioElement.pause()
        audioElement.src = ''
      }
    }
  }, [])

  // 更新播放进度
  const updateProgress = useCallback(() => {
    if (!audioRef.current) return
    const currentTime = audioRef.current.currentTime
    const audioDuration = audioRef.current.duration || 0

    setProgress(currentTime)
    setDuration(audioDuration)

    // 计算并更新进度百分比
    if (audioDuration > 0) {
      const percentage = (currentTime / audioDuration) * 100
      setProgressPercentage(percentage)
      console.log('Progress:', percentage.toFixed(2) + '%')
    }
  }, [audioRef.current])

  // 监听滚动事件，控制回到顶部按钮的显示
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true)
      } else {
        setShowScrollTop(false)
      }

      // 更新当前章节
      if (chapters.length === 0) return
      const scrollPosition = window.scrollY + 100
      // 找到当前可见的章节
      for (let i = chapters.length - 1; i >= 0; i--) {
        const element = document.getElementById(chapters[i].id)
        if (element && element.offsetTop <= scrollPosition) {
          setActiveChapter(chapters[i].id)
          break
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [chapters])

  // 获取文章章节
  useEffect(() => {
    if (pathname.includes('/post/')) {
      const articleElement = document.querySelector('article')
      if (articleElement) {
        const headings = articleElement.querySelectorAll('h2, h3, h4, h5, h6')
        if (headings.length > 0) {
          const chapterData = Array.from(headings).map((heading, index) => {
            const id = heading.id || `chapter-${index}`
            if (!heading.id) {
              heading.id = id
            }
            return {
              id,
              title: heading.textContent ?? `章节 ${index + 1}`,
              level: parseInt(heading.tagName.substring(1))
            }
          })
          setChapters(chapterData)
        } else {
          setChapters([])
        }
      }
    } else {
      setChapters([])
    }
  }, [pathname])

  // 回到顶部
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    })
  }

  // 播放下一首曲目
  const playNextTrack = () => {
    if (!audio) return

    // 获取一个不同的随机索引
    let nextIndex
    do {
      nextIndex = getRandomTrackIndex()
    } while (nextIndex === currentTrackIndex && musicList.length > 1)

    setCurrentTrackIndex(nextIndex)
    audio.src = musicList[nextIndex]
    audio.load() // 确保加载新的音频
    if (isPlaying) {
      const playPromise = audio.play()

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('播放音乐失败:', error)
          setIsPlaying(false) // 如果播放失败，更新状态
        })
      }
    }
  }

  // 播放/暂停音乐
  const toggleMusic = () => {
    if (!audio) return

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      const playPromise = audio.play()

      if (playPromise !== undefined) {
        playPromise.catch((error) => {
          console.error('播放音乐失败:', error)
          // 尝试加载新的音频并播放
          playNextTrack()
        })
        setIsPlaying(true)
      }
    }
  }

  // 格式化时间
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
  }

  // 跳转到指定章节
  const scrollToChapter = (chapterId: string) => {
    const element = document.getElementById(chapterId)
    if (element) {
      window.scrollTo({
        top: element.offsetTop - 80,
        behavior: 'smooth'
      })
      setActiveChapter(chapterId)
      setShowChapters(false)
    }
  }

  return (
    <div className="fixed bottom-3 right-3 md:bottom-6 md:right-[50%] md:mr-[-580px] flex flex-col md:gap-3 gap-1 z-50">
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
          aria-label="回到顶部"
        >
          <ArrowUp size={20} />
        </button>
      )}
      <div className="relative">
        {isPlaying && (
          <div
            className="absolute top-0 left-0 w-10 h-10 z-20 pointer-events-none"
            role="progressbar"
            aria-valuenow={progressPercentage}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`播放进度 ${formatTime(progress)}/${formatTime(duration)}`}
          >
            {/* 灰色背景圈 */}
            <div className="absolute inset-0 rounded-full border-4 border-gray-200  dark:border-gray-900 opacity-70"></div>

            {/* 灰色进度圈 */}
            <svg className="absolute inset-0 w-full h-full -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="none"
                stroke="rgb(209, 213, 219)"
                strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - progressPercentage / 100)}`}
                // className="dark:stroke-gray-400"
                style={{
                  transition: 'stroke-dashoffset 0.1s linear'
                  // opacity: 0.9
                }}
              />
            </svg>
          </div>
        )}
        <button
          onClick={() => {
            toggleMusic()
          }}
          className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all relative z-10"
          aria-label={isPlaying ? '暂停音乐' : '播放音乐'}
        >
          {isPlaying ? <Pause size={20} /> : <Music size={20} />}
        </button>
      </div>
      {chapters.length > 0 && (
        <div className="relative">
          <button
            onClick={() => {
              setShowChapters(!showChapters)
            }}
            className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 shadow-md flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
            aria-label={showChapters ? '隐藏章节' : '显示章节'}
          >
            <List size={20} />
          </button>
          {showChapters && (
            <div className="absolute bottom-0 right-12 w-60 bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <div className="p-2">
                <ul className="space-y-0">
                  {chapters.map((chapter, index) => {
                    // 跳过第一个标题
                    if (index === 0) return null

                    return (
                      <li
                        key={chapter.id}
                        className="text-sm"
                        style={{ paddingLeft: chapter.level > 2 ? `${(chapter.level - 2) * 12}px` : '0' }}
                      >
                        <button
                          className={`block w-full text-left py-1 px-2 rounded-sm transition-colors ${
                            activeChapter === chapter.id
                              ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-gray-100 font-medium border-gray-400 dark:border-gray-500'
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }`}
                          onClick={() => {
                            scrollToChapter(chapter.id)
                          }}
                        >
                          <div className="flex items-center">
                            <div className={`w-1 h-1 rounded-full mr-2 ${
                              activeChapter === chapter.id
                                ? 'bg-gray-600 dark:bg-gray-400'
                                : 'bg-gray-400 dark:bg-gray-500'
                            }`}></div>
                            <span className="truncate">{chapter.title}</span>
                          </div>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default FloatingButtons
