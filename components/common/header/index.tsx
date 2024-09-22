'use client'
import React, { Fragment, type ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, Transition } from '@headlessui/react'
import cn from 'classnames'
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'
import { useIsomorphicLayoutEffect } from '@/hooks/useIsomorphicLayoutEffect'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  logo?: string | ReactNode
  menus?: Array<{ name: string, id?: string, path?: string, children?: Array<{ name: string, path: string }> }>
}

function updateTheme () {
  if (
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  ) {
    document.documentElement.classList.add('dark', 'changing-theme')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#161b22')
  } else {
    document.documentElement.classList.remove('dark', 'changing-theme')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#ffffff')
  }
  window.setTimeout(() => {
    document.documentElement.classList.remove('changing-theme')
  })
}

export const Header: React.FC<HeaderProps> = ({
  logo = ''
}) => {
  const defaultMenus = [{
    name: '首页',
    id: 'home',
    path: '/'
  }, {
    name: '分类',
    id: 'category',
    children: []
  }, {
    name: '归档',
    id: 'archive',
    disabled: true
  },
  {
    name: '留言',
    id: 'guestbook'
  },
  {
    name: '友链',
    id: 'link',
    disabled: true
  }, {
    name: '关于',
    id: 'about'
  }]

  const [menus, setMenus] = useState<Array<{
    name: string
    disabled?: boolean
    id?: string
    path?: string
    children?: Array<{ name: string, path: string }>
  }>>(defaultMenus)
  const inputRef = React.useRef<HTMLInputElement>(null)

  useEffect(() => {
    void fetch('/api/category')
      .then(async res => await res.json())
      .then(res => {
        setMenus(menus => menus.map(item => {
          if (item.id === 'category') {
            return {
              ...item,
              children: res.map((item: { name: string, slug: string }) => {
                return {
                  name: item.name,
                  path: `/category/${item.slug}`
                }
              })
            }
          }
          return item
        }))
      })
  }, [])
  const router = useRouter()
  const clickTheme = (): void => {
    if (localStorage.theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  const setTheme = (theme: 'dark' | 'light') => {
    if (theme === 'dark') {
      localStorage.theme = 'dark'
    } else {
      localStorage.theme = 'light'
    }
    updateTheme()
  }

  useIsomorphicLayoutEffect(() => {
    if (typeof window !== 'undefined') {
      // On page load or when changing themes, best to add inline in `head` to avoid FOUC
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setTheme('dark')
      } else {
        setTheme('light')
      }
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', (event) => {
      if (event.matches) {
        setTheme('dark')
      } else {
        setTheme('light')
      }
    })
  }, [])
  // const user = useSelector(selectUser)

  useIsomorphicLayoutEffect(() => {
    function onStorage () {
      updateTheme()
      const theme = localStorage.theme
      setTheme(theme)
    }

    window.addEventListener('storage', onStorage)

    return () => {
      window.removeEventListener('storage', onStorage)
    }
  }, [])

  const startSearch = () => {
    if (search !== '') {
      router.push(`/search?q=${search}`)
      setSearch('')
      setMenuType('search')
    }
  }

  const [menuType, setMenuType] = useState<'search' | 'close' | 'menu'>('search')

  const [search, setSearch] = useState<string>('')

  return (
    <header
      className="border-b border-solid border-b-light-line dark:bg-dark-light dark:border-b-dark-line align-middle flex items-start ">
      <Link href="/" className="md:mr-auto">
        {typeof logo === 'string' ? <h1>{logo}</h1> : logo}
      </Link>
      <div
        className={cn('flex flex-col-reverse text-sm text-gray-700 items-center mt-8 md:mt-0 dark:text-white md:h-auto duration-200 transition-all', menuType === 'close' ? 'h-56 opacity-100' : 'h-0 opacity-0 md:opacity-100')}>
        <div
          className={cn('flex-1 md:space-x-5 space-y-1.5 flex flex-col md:flex-row justify-center items-end duration-100 transition-[opacity]', menuType === 'close' ? 'opacity-100 md:opacity-0' : 'opacity-0 md:opacity-100')}>
          {menus.map((menu, index) => {
            return ((menu.children?.length) != null)
              ? (
                <Menu key={menu.name} as="div" className="relative inline-block text-center">
                  <Menu.Button className="hover:underline">{menu.name}</Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                    <Menu.Items className="absolute -left-8 z-10 mt-2 w-24 origin-top-right
                                    rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5
                                    focus:outline-none dark:bg-dark-light dark:ring-dark-line ">
                      <div className="py-1">
                        {menu.children.map((child, index) => {
                          return (<Menu.Item key={child.name}>
                            {({ active }) => (
                              <Link
                                href={child.path}
                                className={cn(
                                  active ? 'bg-gray-100 text-gray-900 dark:bg-gray-800' : 'text-gray-700',
                                  'block px-4 py-2 text-sm dark:text-white'
                                )}
                              >
                                {child.name}
                              </Link>
                            )}
                          </Menu.Item>)
                        })}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
                )
              : <Link key={menu.name}
                      className={cn('hover:underline text', menu.disabled && 'cursor-not-allowed opacity-80')}
                      href={menu.disabled ? '#' : menu.path ?? `/${menu.id as string}`}>{menu.name}</Link>
          })}
        </div>
        <div
          className={cn('w-48 search md:absolute md:right-28 translate-x-3 duration-[50ms] md:duration-200 transition-all', menuType === 'close' ? 'md:translate-y-1 opacity-100 ' : '-translate-y-4 opacity-0 md:-translate-y-3')}>
          <input
            className="border-b rounded-none border-solid border-gray-500 text-center h-8 pr-5 outline-0 w-full box-border dark:bg-transparent appearance-none outline-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                startSearch()
              }
            }}
            ref={inputRef}
            autoFocus
            placeholder="请输入关键词搜索" value={search} onChange={(e) => {
              setSearch(e.target.value)
            }}/>
          <button className="search-icon absolute right-0" onClick={() => {
            startSearch()
          }}></button>
        </div>

      </div>
      <div className="flex justify-center items-center space-x-3 md:ml-8 md:translate-y-[3%]">
        <div className={cn(menuType, 'md:menu')} onClick={() => {
          if (menuType === 'search') {
            inputRef.current?.focus()
          }
          setMenuType(menuType === 'close' ? 'search' : 'close')
        }}>
          <button className="nav-icon relative translate-y-[1%]">
            <span></span>
          </button>
        </div>
        <div className="hover:cursor-pointer flex justify-center translate-y-[1px] w-7" onClick={clickTheme}>
          <SunIcon className="md:w-6 w-7 block dark:hidden"/>
          <MoonIcon className="md:w-5 w-6 hidden dark:block"/>
        </div>
      </div>
    </header>
  )
}
