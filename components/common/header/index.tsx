import React, { ReactNode } from 'react';

import { selectUser } from "@/store/user";
import { Fragment } from 'react'

import { useSelector } from "react-redux";
import Link from 'next/link';
import { Menu, Transition } from '@headlessui/react'
import classNames from 'classnames';


interface HeaderProps {
    logo?: string | ReactNode,
    menus?: Array<{ name: string, path: string, children?: Array<{ name: string, path: string }> }>
}

export const Header = ({ logo = "", menus = [] }: HeaderProps) => {
    const user = useSelector(selectUser);

    return (
        <header className='min-h-48 dark:bg-dark-light'>
            <div>
                {typeof logo === 'string' ? <h1>{logo}</h1> : logo}
            </div>
            <div className='flex space-x-5 text-sm text-gray-700'>
                {menus.map((menu, index) => {
                    return menu.children?.length ? (
                        <Menu key={menu.name} as="div" className="relative inline-block text-center">
                            <Menu.Button className='hover:underline'>{menu.name}</Menu.Button>
                            <Transition
                                as={Fragment}
                                enter="transition ease-out duration-100"
                                enterFrom="transform opacity-0 scale-95"
                                enterTo="transform opacity-100 scale-100"
                                leave="transition ease-in duration-75"
                                leaveFrom="transform opacity-100 scale-100"
                                leaveTo="transform opacity-0 scale-95"
                            >
                                <Menu.Items className="absolute -left-8 z-10 mt-2 w-24 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1">
                                        {menu.children.map((child, index) => {
                                            return (<Menu.Item key={child.name}>
                                                {({ active }) => (
                                                    <Link
                                                        href={child.path}
                                                        className={classNames(
                                                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                                                            'block px-4 py-2 text-sm'
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
                    ) : <Link key={menu.name} className='hover:underline' href={menu.path}>{menu.name}</Link>
                })}
            </div>
        </header>
    )
};
