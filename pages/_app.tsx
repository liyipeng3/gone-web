import '@/styles/globals.css'
import '@/styles/App.scss';
import '@/styles/button.scss';
import '@/styles/header.scss';
import '@/styles/footer.scss';

import type {AppProps} from 'next/app'


import React from 'react';
import {wrapper} from "@/store";
import {Layout} from "@/components/layout";
import {themeSlice} from "@/store/common/theme";

export const getServerSideProps = wrapper.getServerSideProps(
    () =>
        async () => {
            return {props: {}};
        }
);

function App({Component, pageProps}: AppProps) {
    return (

        <Layout>
            <Component {...pageProps}/>
        </Layout>

    );
}

export default wrapper.withRedux(App);
;
