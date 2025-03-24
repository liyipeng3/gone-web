import React, { type FC, useEffect } from 'react'
import { assistant } from '@/components/custom/Assistant/assistant'

export const Assistant: FC = () => {
  useEffect(() => {
    let interval: any = null
    let loaded = false
    const loadAssistant = () => {
      if (screen && screen.width >= 768 && !loaded) {
        interval = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
          if (window?.loadlive2d) {
            assistant({
              hidden: false,
              model: '/lib/assistant/model.json',
              tips: true
            })
            clearInterval(interval)
            loaded = true
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
        <div className="border-[#eee] border assistant-dialog bg-white dark:bg-gray-900 dark:border-gray-700"></div>
        <canvas id="assistant" width="280" height="280"/>
      </div>
    </>
  )
}
