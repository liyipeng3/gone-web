'use client'
import { siteConfig } from '@/config/site'
import type React from 'react'
import { useEffect } from 'react'

const AllView: React.FC = () => {
  useEffect(() => {
    const v = sessionStorage.getItem('iv')
    if (v == null) {
      sessionStorage.setItem('_v', '1')
      void fetch('/api/iv', {
        method: 'GET'
      }).then(_ => {
      })
    }
    console.log(`%c ${siteConfig.name} %c ${siteConfig.url}`, 'color: #fff; margin: 1em 0; padding: 5px 0; background: #00a9e0;', 'margin: 1em 0; padding: 5px 0; background: #efefef;')
  }, [])

  return null
}

export default AllView
