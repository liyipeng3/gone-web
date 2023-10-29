'use client'
import { type FC, useEffect, useRef, useState } from 'react'
import _ from 'lodash-es'
import EasyMDE from 'easymde'
import 'easymde/dist/easymde.min.css'
import marked from '@/lib/marked'

interface EditorProps {
  value?: string
  onChange?: (value?: string) => void
  className?: string
}

export const Editor: FC<EditorProps> = ({
  value = undefined,
  onChange,
  className
}) => {
  const [id] = useState(_.uniqueId('editor-'))
  const editorRef = useRef<EasyMDE | null>(null)

  useEffect(() => {
    if (!editorRef.current && value !== undefined) {
      const element = document.getElementById(id) ?? undefined
      editorRef.current = new EasyMDE({
        element,
        initialValue: value,
        previewRender: (value, _) => { return (marked.parse(value) as string) },
        spellChecker: false,
        previewClass: 'prose-preview-container'
      })
      editorRef.current?.codemirror?.on('change', () => {
        console.log(11)
        onChange?.(editorRef.current?.value())
      })
    }
  }, [value])

  return (<textarea className={className} id={id}></textarea>)
}
