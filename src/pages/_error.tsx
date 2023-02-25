import { type FC, type ReactNode } from 'react'

interface ErrorProps {
  statusCode: number
}

const errorMap: Record<number, string | ReactNode> = {
  404: 'Not Found',
  500: 'Server Error'
}

interface getInitialPropsParams {
  res?: {
    statusCode: number
  }
  err?: {
    statusCode: number
  }
}

const getError = (statusCode: number) => {
  if (errorMap[statusCode] === undefined) {
    return `${statusCode} Unknown Error`
  }
  if (typeof errorMap[statusCode] === 'string') {
    return `${statusCode} ${errorMap[statusCode] as string}`
  } else {
    return errorMap[statusCode]
  }
}

const Error: FC<ErrorProps> & { getInitialProps: any } = ({ statusCode }) => {
  return (
    <div>
      {(statusCode !== 0)
        ? getError(statusCode)
        : 'Client Error'}
    </div>
  )
}

Error.getInitialProps = ({
  res,
  err
}: getInitialPropsParams) => {
  const statusCode = (res != null) ? res.statusCode : (err != null) ? err.statusCode : 404
  return { statusCode }
}

export default Error
