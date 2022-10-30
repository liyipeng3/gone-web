import {Action, AnyAction, configureStore, ThunkAction} from '@reduxjs/toolkit';
import {createWrapper} from "next-redux-wrapper";

import {nextReduxCookieMiddleware, wrapMakeStore} from "next-redux-cookie-wrapper";
import {useDispatch} from "react-redux";
import {themeSlice} from "@/store/common/theme";
import {userSlice} from "@/store/user";

const makeStore = wrapMakeStore(() =>
    configureStore({
            reducer: {
                [themeSlice.name]: themeSlice.reducer,
                [userSlice.name]: userSlice.reducer
            },
            middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(nextReduxCookieMiddleware({
                subtrees: [
                    'user.username', 'theme.name',
                ],
            })),
        }
    )
);

export type AppStore = ReturnType<typeof makeStore>;
export type AppState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
export type AppThunkAction<ReturnType = Promise<void>> = ThunkAction<
    ReturnType,
    AppState,
    unknown,
    AnyAction
    >;

export const useAppDispatch = () => useDispatch<AppDispatch>();

export const wrapper = createWrapper<AppStore>(makeStore, {debug: false});
