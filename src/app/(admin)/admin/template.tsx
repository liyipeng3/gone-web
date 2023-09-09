import React from 'react'
import Image from 'next/image'

const AdminLayout: React.FC<{
  children: React.ReactNode
}> = ({ children }) => {
  return (
    <div className="flex flex-col h-screen">
        <div className="flex flex-1">
            <div className="w-64 bg-gray-100 dark:bg-gray-800">
                <div className="flex items-center justify-center mt-10">
                    <div className="flex items-center">
                        <span className="text-gray-800 dark:text-white text-2xl font-semibold">lyp123</span>
                    </div>
                </div>
                <nav className="mt-10">
                    <a className="flex items-center mt-4 py-2 px-6 bg-gray-200 dark:bg-gray-700 bg-opacity-25 dark:bg-opacity-25 text-gray-600 dark:text-gray-400" href="#">
                        <span className="mx-3">Dashboard</span>
                    </a>
                    <a className="flex items-center mt-4 py-2 px-6 bg-gray-200 dark:bg-gray-700 bg-opacity-25 dark:bg-opacity-25 text-gray-600 dark:text-gray-400" href="#">
                        <span className="mx-3">Posts</span>
                    </a>
                    <a className="flex items-center mt-4 py-2 px-6 bg-gray-200 dark:bg-gray-700 bg-opacity-25 dark:bg-opacity-25 text-gray-600 dark:text-gray-400" href="#">
                        <span className="mx-3">Users</span>
                    </a>
                    <a className="flex items-center mt-4 py-2 px-6 bg-gray-200 dark:bg-gray-700 bg-opacity-25 dark:bg-opacity-25 text-gray-600 dark:text-gray-400" href="#">
                        <span className="mx-3">Settings</span>
                    </a>
                </nav>
            </div>
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center py-4 px-6 bg-white dark:bg-gray-800 shadow">
                    <div className="flex items-center">
                        <button className="text-gray-500 focus:outline-none lg:hidden">
                            <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                <path d="M4 6h16M4 12h8m-8 6h16"/>
                            </svg>
                        </button>
                        <div className="relative mx-4 lg:mx-0">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center">
                                <svg className="h-5 w-5 text-gray-500" viewBox="0 0 24 24" fill="none">
                                    <path d="M21 21l-5.2-5.2"/>
                                    <circle cx="11" cy="11" r="8"/>
                                </svg>
                            </span>
                            <input className="form-input w-32 sm:w-64 rounded-md pl-10 pr-4 focus:border-indigo-600" type="text" placeholder="Search"/>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="relative">
                            <button className="relative block h-8 w-8 rounded-full overflow-hidden shadow focus:outline-none">
                                <Image width={8} height={8} className="h-full w-full object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&q=80&fm=jpg&crop=faces&fit=crop&h=64&w=64" alt="Your avatar"/>
                                <div className="absolute inset-0 rounded-full shadow-inner" aria-hidden="true"></div>
                            </button>
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-200 dark:bg-gray-900">
                    <div className="container mx-auto px-6 py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    </div>
  )
}
export default AdminLayout
