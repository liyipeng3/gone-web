'use client'
import { type FC } from 'react'
import 'easymde/dist/easymde.min.css'
import marked from '@/lib/marked'
import dynamic from 'next/dynamic'

const SimpleMDE = dynamic(async () => await import('react-simplemde-editor'), { ssr: false })

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
  // const [id] = useState(_.uniqueId('editor-'))
  // const editorRef = useRef<EasyMDE | null>(null)

  // useEffect(() => {
  //   if (!editorRef.current && value !== undefined) {
  //     const element = document.getElementById(id) ?? undefined
  //     editorRef.current = new EasyMDE({
  //       element,
  //       initialValue: value,
  //       previewRender: (value, _) => {
  //         return (marked.parse(value) as string)
  //       },
  //       spellChecker: false,
  //       previewClass: 'prose-preview-container'
  //     })
  //     editorRef.current?.codemirror?.on('change', () => {
  //       onChange?.(editorRef.current?.value())
  //     })
  //   }
  // }, [value, id, onChange])

  return (<SimpleMDE options={{
    previewRender: (value, _) => {
      return (marked.parse(value) as string)
    },
    previewClass: 'prose-preview-container'
  }} value={value} onChange={onChange} className={className}
                     spellCheck={false}/>)
}
