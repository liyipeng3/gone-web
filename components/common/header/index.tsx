import React from 'react';

import {selectUser} from "@/store/user";
import {useSelector} from "react-redux";
import {wrapper} from "@/store";

interface HeaderProps {
    logo?: string
}

export const Header = ({logo = ""}: HeaderProps) => {
    const user = useSelector(selectUser)

    return (
        <header>
            <div>
                {logo}
                <h1>lyp123</h1>
            </div>
            <span>{user.username}</span>
        </header>
    )
};

export const getServerSideProps = wrapper.getServerSideProps(
    () =>
        async () => {
            return {props: {}};
        }
);
