'use client'
import { type FC, useEffect } from 'react'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

const Error: FC<ErrorProps> = ({
  error,
  reset
}) => {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <>
      <div className="flex flex-col bg-gray-50 items-center justify-center h-screen">
        <h1 className="text-2xl font-bold mb-4 ">500 - Internal Server Error</h1>
        <p className="text-base text-gray-600">Sorry, an error occurred. Please try again later.</p>

        <div className="mt-4 text-center text-lg">
          <button className="text-blue-500 hover:underline" onClick={() => {
            reset()
          }}>
            Try again
          </button>
        </div>
      </div>
    </>
  )
}

export default Error
