import Script from 'next/script'
import React, { type FC, useEffect } from 'react'
import { assistant } from '@components/custom/Assistant/assistant'

export const Assistant: FC = () => {
  useEffect(() => {
    assistant({
      hidden: false,
      model: '/lib/assistant/model.json',
      tips: true
    })
  }, [])
  return (<div className="assistant-container">
    <Script src="/lib/l2d.js" strategy="beforeInteractive"/>
    <div className="assistant-dialog"></div>
    <canvas id="assistant" width="280" height="280"/>
  </div>)
}
