import React, { type FC, useEffect } from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'

export interface InputTagProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  className?: string
}

const InputTag: FC<InputTagProps> = ({
  className,
  value,
  onChange,
  placeholder,
  ...props
}) => {
  useEffect(() => {
    setTags(value)
  }, [value])
  const [tags, setTags] = React.useState<string[]>(value || [])
  const inputRef = React.useRef<HTMLDivElement>(null)
  const [textValue, setTextValue] = React.useState('' as string)

  const addTags = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      console.log(tags, inputRef.current?.textContent)
      if (!Array.isArray(tags)) {
        return
      }
      event.preventDefault() // prevent the addition of a new line in the contentEditable element
      if (inputRef.current?.textContent && !tags?.includes(inputRef.current.textContent)) {
        const newTags = [...tags, inputRef.current.textContent]
        setTags(newTags)
        onChange(newTags)
      }
    }
  }

  const removeTag = (index: number) => {
    const newTags = tags.filter((_tag, i) => i !== index)
    setTags(newTags)
    onChange(newTags)
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Backspace' && inputRef.current?.textContent === '') {
      removeTag(tags.length - 1)
    }
  }

  React.useEffect(() => {
    if (inputRef.current) {
      inputRef.current.textContent = ''
    }
  }, [tags])

  return (
    <div className={`flex items-center border rounded px-2.5 py-1.5 text-sm bg-white ${className} flex-wrap min-h-10 `}
         onFocus={(e) => {
           e.currentTarget.classList.add('ring-2')
           e.currentTarget.classList.add('ring-offset-2')
         }}
         onBlur={(e) => {
           e.currentTarget.classList.remove('ring-2')
           e.currentTarget.classList.remove('ring-offset-2')
         }}>
      {tags?.map((tag, index) => (
        <div key={index} className="tag mr-2 my-0.5 bg-gray-200 rounded px-2 py-1 flex items-center whitespace-nowrap">
          <span className="text-sm">{tag}</span>
          <button
            onClick={() => {
              removeTag(index)
            }}
            className="ml-1 hover:bg-gray-600 hover:text-white transition-colors duration-200 rounded-full p-0.5"
          >
            <Cross2Icon className="w-3 h-3"/>
          </button>
        </div>
      ))}
      <div
        className="flex-grow focus:outline-none "
        contentEditable
        suppressContentEditableWarning
        onKeyDown={(event) => {
          addTags(event)
          handleKeyDown(event)
        }}
        onInput={(e) => {
          setTextValue(e.currentTarget.textContent ?? '')
        }}
        ref={inputRef}
        {...props}
      />

      {tags?.length === 0 && !textValue
        ? (
          <span
            style={{
              position: 'absolute',
              color: '#aaa',
              pointerEvents: 'none'
            }}
          >
          {placeholder}
        </span>
          )
        : null}
    </div>
  )
}

export { InputTag }
