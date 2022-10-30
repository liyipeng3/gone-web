import React from 'react';

import {AiOutlineGithub} from "react-icons/ai";
import {IoPersonCircleSharp} from "react-icons/io5";

interface FooterProps {
    logo?: string
}

export const Footer = ({logo = ''}: FooterProps) => {

    return (
        <footer className='dark:bg-dark-light  dark:border-t-dark-line border-t border-solid'>
            <span>{logo}</span>
            <div className='flex flex-row'>
                {/*<IoPersonCircleSharp className="head" onClick={() => window.open("https://lyp123.com", "_blank")}/>*/}
                <AiOutlineGithub className="github"
                                 onClick={() => window.open("https://github.com/liyipeng123", "_blank")}/>
            </div>
        </footer>
    )
};
