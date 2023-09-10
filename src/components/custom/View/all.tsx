'use client'
import type React from 'react'
import { useEffect } from 'react'

const AllView: React.FC = () => {
  useEffect(() => {
    const v = sessionStorage.getItem('_v')
    if (v == null) {
      sessionStorage.setItem('_v', '1')
      void fetch('/api/_v', {
        method: 'GET'
      }).then(_ => {
      })
    }
    console.log('%c lyp123 %c https://lyp123.com ', 'color: #fff; margin: 1em 0; padding: 5px 0; background: #00a9e0;', 'margin: 1em 0; padding: 5px 0; background: #efefef;')
  }, [])

  return null
}

export default AllView
