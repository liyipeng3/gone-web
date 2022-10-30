import {logout, userSlice} from "@/store/user";
import {useRef, useState} from "react";
import {themeSlice} from "@/store/common/theme";
import Link from "next/link";
import {useAppDispatch} from "@/store";
import {Button} from "@/components/common/button";
// import CompState from "@/components/test/state";

export default function IndexScreen() {
    const dispatch = useAppDispatch();

    const testRef = useRef(Date.now());
    const setUser = () => {
        dispatch(userSlice.actions.login({uid, username}))
        //dispatch(login({uid, username}))
    }
    const setMyTheme = (name: 'dark' | 'light') => {
        dispatch(themeSlice.actions.setTheme({name}))
    }
    const [uid, setUid] = useState(-1)
    const [username, setUsername] = useState('未登录');
    const [count, setCount] = useState(0)
    return (
        <div className='space-x-2'>
            <div className="hidden">Now in index</div>
            <Link href='/about'>about</Link>
            <div className='main'>
                <div className='box'>aa</div>
            </div>
            {/*<CompState/>*/}
            {/*<Counter />*/}
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
            {count}

            <button onClick={() => {
                dispatch(logout())
            }}>logout
            </button>
            <button onClick={() => {
                //setMyTheme('dark')
                localStorage.theme = 'dark'
                document.documentElement.classList.add('dark')
            }}>dark
            </button>
            <button onClick={() => {
                //setMyTheme('light');
                localStorage.theme = 'light'
                document.documentElement.classList.remove('dark')
            }}>light
            </button>
            {/*<DemoComponent></DemoComponent>*/}
            <button onClick={() => {
                testRef.current = Date.now()
            }}>ref
            </button>
        </div>
    )
}
