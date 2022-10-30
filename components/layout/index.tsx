import React, {ReactNode} from "react";
import cn from "classnames";
import {Header} from "@/components/common/header";
import {Footer} from "@/components/common/footer";
import {useSelector} from "react-redux";
import {selectTheme} from "@/store/common/theme";

export const Layout = ({children}: { children: ReactNode }) => {
    const theme = useSelector(selectTheme);

    return (
        <div className={cn("container", `theme-${theme.name}`)}>
            <Header/>
            {children}
            <Footer/>
        </div>
    )

}