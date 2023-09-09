'use client'
import React, { useState } from 'react'
import { Button } from '@/components/common/button'

const Login = () => {
  const [account, setAccount] = useState({
    username: '',
    password: ''
  })

  const submit = () => {
    console.log(account)
  }

  return (
    <div>
      <input onChange={(e) => {
        setAccount({
          ...account,
          username: e.target.value
        })
      }}/>
      <input onChange={(e) => {
        setAccount({
          ...account,
          password: e.target.value
        })
      }} type="password"/>
      <Button onClick={() => {
        submit()
      }} />
    </div>
  )
}

export default Login
