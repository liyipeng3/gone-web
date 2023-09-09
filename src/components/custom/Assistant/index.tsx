import React, { type FC } from 'react'
import { assistant } from '@/components/custom/Assistant/assistant'
import Script from 'next/script'

export const Assistant: FC = () => {
  // useEffect(() => {
  //
  // }, [])
  return (
    <>
      <Script src="/lib/l2d.js" onLoad={() => {
        assistant({
          hidden: false,
          model: '/lib/assistant/model.json',
          tips: true
        })
      }} />
      <div className="assistant-container hidden md:block">
        <div className="border-[#eee] border assistant-dialog bg-white dark:bg-gray-900 dark:border-gray-700"></div>
        <canvas id="assistant" width="280" height="280"/>
      </div>
    </>
  )
}
