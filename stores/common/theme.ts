import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppState } from '@stores'

export interface themeState {
  name: 'light' | 'dark'
}

const initialState: themeState = {
  name: 'light'
}

export const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme (state, { payload }: PayloadAction<{ name: string }>) {
      state.name = payload.name as 'light' | 'dark'
    }
  }
})

export const selectTheme = (state: AppState) => state[themeSlice.name]

export default themeSlice.reducer
