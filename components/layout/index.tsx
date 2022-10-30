import React, { ReactNode } from "react";
import cn from "classnames";
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { useSelector } from "react-redux";
import { selectTheme } from "@/store/common/theme";

export const Layout = ({ children }: { children: ReactNode }) => {
    if(typeof window !== 'undefined') {
        // On page load or when changing themes, best to add inline in `head` to avoid FOUC
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
        } else {
            document.documentElement.classList.remove('dark')
        }
    }

    const theme = useSelector(selectTheme);
    const menus = [{
        name: '首页',
        path: '/'
    }, {
        name: '分类',
        path: '/category',
        children: [{
            name: '生活',
            path: '/category/life'
        }, {
            name: '技术',
            path: '/category/tech'
        }, {
            name: '分享',
            path: '/category/share'
        }]
    }, {
        name: '归档',
        path: '/archive'
    },
    {
        name: '留言',
        path: '/message'
    },
    {
        name: '友链',
        path: '/link'
    }, {
        name: '关于',
        path: '/about'
    },];


    return (
        <div className={cn("document w-screen dark:bg-dark dark:text-white")}>
            <Header logo="lyp123" menus={menus} />
            {children}
            <Footer logo="lyp123" />
        </div>
    )

}