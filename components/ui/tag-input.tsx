import * as React from 'react'
import { Cross2Icon } from '@radix-ui/react-icons'

export interface InputTagProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
}

const InputTag = React.forwardRef<HTMLInputElement, InputTagProps>(
  ({
    className,
    type,
    value,
    ...props
  }, ref) => {
    const [tags, setTags] = React.useState<string[]>([])
    const inputRef = React.useRef<HTMLDivElement>(null)

    const addTags = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Enter') {
        event.preventDefault() // prevent the addition of a new line in the contentEditable element
        if (inputRef.current?.textContent && !tags.includes(inputRef.current.textContent)) {
          setTags([...tags, inputRef.current.textContent])
        }
      }
    }

    const removeTag = (index: number) => {
      setTags(tags.filter((tag, i) => i !== index))
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
      <div className={`flex items-center border rounded px-2 py-1.5 text-sm bg-white ${className} flex-wrap min-h-10`}>
        {tags.map((tag, index) => (
          <div key={index} className="tag mr-2 my-0.5 bg-gray-200 rounded px-2 py-1 flex items-center whitespace-nowrap">
            <span className="text-sm">{tag}</span>
            <button
              onClick={() => { removeTag(index) }}
              className="ml-1 hover:bg-gray-600 hover:text-white transition-colors duration-200 rounded-full p-0.5"
            >
              <Cross2Icon className='w-3 h-3' />
            </button>
          </div>
        ))}
        <div
          className="flex-grow focus:outline-none"
          contentEditable
          suppressContentEditableWarning
          onKeyDown={(event) => {
            addTags(event)
            handleKeyDown(event)
          }}
          ref={inputRef}
          {...props}
        />
      </div>
    )
  }
)
InputTag.displayName = 'InputTag'

export { InputTag }
