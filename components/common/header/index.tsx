import React, { Fragment, type ReactNode, useEffect, useState } from 'react'
import Link from 'next/link'
import { Menu, Transition } from '@headlessui/react'
import cn from 'classnames'
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline'

interface HeaderProps {
  logo?: string | ReactNode
  menus?: Array<{ name: string, path: string, children?: Array<{ name: string, path: string }> }>
}

export const Header: React.FC<HeaderProps> = ({
  logo = '',
  menus = []
}) => {
  const clickTheme = (): void => {
    if (localStorage.theme === 'light') {
      setTheme('dark')
    } else {
      setTheme('light')
    }
  }

  const setTheme = (theme: 'dark' | 'light') => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // On page load or when changing themes, best to add inline in `head` to avoid FOUC
      if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        setTheme('dark')
      } else {
        setTheme('light')
      }
    }

    const mediaQueryListDark = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQueryListDark.addEventListener('change', (event) => {
      if (event.matches) {
        setTheme('dark')
      } else {
        setTheme('light')
      }
    })
  }, [])
  // const user = useSelector(selectUser)

  const [menuType, setMenuType] = useState<'search' | 'close' | 'menu'>('search')

  const [search, setSearch] = useState<string>('')

  return (
    <header
      className="min-h-48 border-b border-solid border-b-light-line dark:bg-dark-light dark:border-b-dark-line align-middle flex items-start ">
      <Link href="/" className="md:mr-auto">
        {typeof logo === 'string' ? <h1>{logo}</h1> : logo}
      </Link>
      <div
        className={cn('flex flex-col-reverse text-sm text-gray-700 items-center mt-8 md:mt-0 dark:text-white md:h-auto transition-all duration-200', menuType === 'close' ? 'h-56 opacity-100' : 'h-0 opacity-0 md:opacity-100')}>
        <div
          className={cn('flex-1 md:space-x-5 space-y-1.5 flex flex-col md:flex-row justify-center items-end duration-200 transition-all', menuType === 'close' ? 'opacity-100 md:opacity-0' : 'opacity-0 md:opacity-100')}>
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
              : <Link key={menu.name} className="hover:underline text" href={menu.path}>{menu.name}</Link>
          })}
        </div>
        <div
          className={cn('w-48 search md:absolute md:right-28 translate-x-3 -top-4 duration-200 transition-all', menuType === 'close' ? 'md:top-4 opacity-100 ' : '-mt-10 opacity-0')}>
          <input
            className="border-b rounded-none border-solid border-gray-500 text-center h-8 pr-5 outline-0 w-full box-border dark:bg-transparent"
            placeholder="请输入关键词搜索" value={search} onChange={(e) => {
              setSearch(e.target.value)
            }}/>
          <button className="search-icon absolute right-0"></button>
        </div>

      </div>
      <div className="flex justify-center items-center space-x-3 md:ml-8 md:translate-y-[3%]">
        <div className={cn(menuType, 'md:menu')} onClick={() => {
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
