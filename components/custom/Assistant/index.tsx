import React, { type FC, useEffect, useRef, useState } from 'react'
import { assistant } from '@/components/custom/Assistant/assistant'

export const Assistant: FC = () => {
  const dialogRef = useRef<HTMLDivElement>(null)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    let interval: any = null
    let loaded = false

    const loadAssistant = async () => {
      if (window.matchMedia('(min-width: 768px)').matches && !loaded) {
        interval = setInterval(async () => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
          if (window?.loadlive2d && !loaded) {
            loaded = true
            await assistant({
              model: '/lib/assistant/model.json',
              tips: true,
              selector: {
                articles: '.post-title'
              }
            })
            clearInterval(interval)
            setLoading(false)
          }
        }, 100)
        setTimeout(() => {
          clearInterval(interval)
          setLoading(false)
        }, 30 * 1000)
      }
    }

    window.addEventListener('resize', loadAssistant)
    void loadAssistant()

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', loadAssistant)
    }
  }, [])

  return (
    <div className="assistant-container hidden md:block">
      {loading && (
        <div className="assistant-loading absolute inset-0 flex items-center justify-center animate-fade-out">
          <div className="relative w-10 h-10">
            <div className="absolute inset-0 opacity-75 rounded-full border-2 border-primary animate-ping"></div>
            <div className="absolute inset-0 border-2 border-primary rounded-full animate-pulse"></div>
          </div>
        </div>
      )}
      <div ref={dialogRef} className="border-[#eee] border assistant-dialog bg-white dark:bg-gray-900 dark:border-gray-700 transition-all max-w-[20vw] break-words" />
      <canvas
        id="assistant"
        width="280"
        height="280"
        className={`${loading ? 'opacity-0' : 'animate-fade-in'}`}
        aria-label="虚拟助手形象"
      />
    </div>
  )
}
