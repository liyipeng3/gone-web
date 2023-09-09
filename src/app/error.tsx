'use client'
import { type FC } from 'react'

interface ErrorProps {
  error: Error
  reset: () => void
}

// eslint-disable-next-line n/handle-callback-err
const Error: FC<ErrorProps> = ({
  error,
  reset
}) => {
  return (
    <>
      <h2>Something went wrong!</h2>
      <button onClick={() => {
        reset()
      }}>Try again
      </button>
    </>
  )
}

export default Error
