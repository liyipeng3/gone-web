'use client'
import React from 'react'
import cn from 'classnames'
import { FiCheck, FiCopy } from 'react-icons/fi'

interface CopyButtonProps {
  text: string
  className?: string
}

const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  className
}) => {
  const [copied, setCopied] = React.useState(false)
  return (
    <div
      className={cn('cursor-pointer flex justify-center items-center gap-0.5 hover:bg-white/30 rounded py-0.5 px-1.5 hover:transition transition', className)}
      onClick={async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => {
          setCopied(false)
        }, 1000)
      }}>
      {!copied ? <FiCopy/> : <FiCheck/>}{!copied ? '复制' : '已复制'}
    </div>
  )
}

export default CopyButton
