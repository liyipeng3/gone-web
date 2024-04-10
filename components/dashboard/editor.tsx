'use client'
import 'easymde/dist/easymde.min.css'
import marked from '@/lib/marked'
import dynamic from 'next/dynamic'
import type EasyMDE from 'easymde'
import { type FC } from 'react'

const SimpleMDE = dynamic(async () => await import('react-simplemde-editor'), { ssr: false })

interface EditorProps {
  value?: string
  onChange?: (value?: string) => void
  className?: string
}

const options: EasyMDE.Options = {
  previewRender: (value: string, _: any) => {
    return (marked.parse(value) as string)
  },
  previewClass: 'prose-preview-container',
  spellChecker: false
}

export const Editor: FC<EditorProps> = ({
  value = undefined,
  onChange,
  className
}) => {
  return (<SimpleMDE options={options} value={value} onChange={onChange} className={className}/>)
}
