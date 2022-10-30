import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {HYDRATE} from "next-redux-wrapper";
import {AppState} from "@/store";

export interface skinState {
    name: 'light' | 'dark';
}

const initialState: skinState = {
    name: 'light',
};

export const themeSlice = createSlice({
    name: "theme",

    initialState: {name: "light", temp: 0},

    reducers: {
        setTheme(state,{payload}: PayloadAction<{name: string}>) {
            state.name = payload.name;
        }
    },

    extraReducers: {
        [HYDRATE]: (state, {payload}) => ({
            ...state,
            ...payload.theme,
        }),
    },
});

export const selectTheme = (state: AppState) => state[themeSlice.name];

export default themeSlice.reducer;
