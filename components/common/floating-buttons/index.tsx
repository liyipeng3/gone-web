'use client'

import React from 'react'
import { ArrowUp, Music, Pause, List } from 'lucide-react'
import { useAudioPlayer } from './use-audio-player'
import { useArticleChapters } from './use-article-chapters'

// 格式化时间为 m:ss
const formatTime = (time: number): string => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`
}

const FloatingButtons: React.FC = () => {
  const { isPlaying, progress, duration, progressPercentage, toggleMusic } = useAudioPlayer()
  const {
    showScrollTop,
    chapters,
    activeChapter,
    showChapters,
    setShowChapters,
    scrollToTop,
    scrollToChapter
  } = useArticleChapters()

  return (
    <div className="fixed bottom-3 right-3 md:bottom-24 md:right-6 lg:right-8 xl:right-12 flex flex-col md:gap-3 gap-1 z-50">
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
            <div className="absolute inset-0 rounded-full border-4 border-gray-200  dark:border-gray-900 opacity-70"></div>

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
                style={{
                  transition: 'stroke-dashoffset 0.1s linear'
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
      {chapters.length > 1 && (
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
