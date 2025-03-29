import React, { type FC, useEffect, useRef } from 'react'
import { assistant } from '@/components/custom/Assistant/assistant'

export const Assistant: FC = () => {
  const dialogRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    let interval: any = null
    let loaded = false
    const loadAssistant = () => {
      if (screen && screen.width >= 768 && !loaded) {
        interval = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
          if (window?.loadlive2d && !loaded) {
            assistant({
              hidden: false,
              model: '/lib/assistant/model.json',
              tips: true
            })
            clearInterval(interval)
            loaded = true
            dialogRef.current?.classList.remove('opacity-0')
          }
        }, 100)
      }
    }

    window.addEventListener('resize', loadAssistant)
    loadAssistant()

    return () => {
      clearInterval(interval)
      window.removeEventListener('resize', loadAssistant)
    }
  }, [])

  return (
    <>
      <div className="assistant-container hidden md:block">
        <div ref={dialogRef} className="border-[#eee] border assistant-dialog bg-white dark:bg-gray-900 dark:border-gray-700 opacity-0 transition-all"></div>
        <canvas id="assistant" width="280" height="280"/>
      </div>
    </>
  )
}
