import '@/styles/globals.scss'
import '@/styles/App.scss';
import '@/styles/button.scss';
import '@/styles/header.scss';
import '@/styles/footer.scss';

import type {AppProps} from 'next/app'


import React from 'react';
import {wrapper} from "@/store";
import {Layout} from "@/components/layout";
import {Provider} from "react-redux";

export const getServerSideProps = wrapper.getServerSideProps(
    () =>
        async () => {
            return {props: {}};
        }
);

function App({Component, pageProps}: AppProps) {
    const {store} = wrapper.useWrappedStore({Component, pageProps});
    return (
        <Provider store={store}>
            <Layout>
                <Component {...pageProps}/>
            </Layout>
        </Provider>
    );
}

export default App;
;
