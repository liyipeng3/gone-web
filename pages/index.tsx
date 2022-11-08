import { logout, userSlice } from '@/stores/user'
import React, { useState } from 'react'
import Link from 'next/link'
import { useAppDispatch } from '@/stores'
import { Button } from '@/components/common/button'
// import CompState from "@/components/test/state";

const Index: React.FC = () => {
  const dispatch = useAppDispatch()

  const setUser = (): void => {
    dispatch(userSlice.actions.login({
      uid,
      username
    }))
  }
  const [uid, setUid] = useState(-1)
  const [username, setUsername] = useState('未登录')
  return (
    <div className="space-x-2">
      <div className="hidden">Now in index</div>
      <Link href="/about">about</Link>
      uid: <input onChange={(e) => {
        setUid(Number(e.target.value))
      }}/>
      username: <input onChange={(e) => {
        setUsername(e.target.value)
      }}/>
      <Button onClick={() => {
        setUser()
      }}>login
      </Button>
      <button onClick={() => {
        dispatch(logout())
      }}>logout
      </button>
    </div>
  )
}

export default Index
