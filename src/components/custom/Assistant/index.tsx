'use client'
import React, { type FC, useEffect } from 'react'
import { assistant } from '@/components/custom/Assistant/assistant'

export const Assistant: FC = () => {
  useEffect(() => {
    assistant({
      hidden: false,
      model: '/lib/assistant/model.json',
      tips: true
    })
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
