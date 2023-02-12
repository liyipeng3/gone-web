import { type AnyAction, configureStore, type ThunkAction } from '@reduxjs/toolkit'

import { useDispatch } from 'react-redux'
import { themeSlice } from '@stores/common/theme'
import { userSlice } from '@stores/user'

export const store = configureStore({
  reducer: {
    [themeSlice.name]: themeSlice.reducer,
    [userSlice.name]: userSlice.reducer
  }
})

export type AppStore = typeof store
export type AppState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
export type AppThunkAction<ReturnType = Promise<void>> = ThunkAction<ReturnType,
AppState,
unknown,
AnyAction>

export const useAppDispatch = () => useDispatch<AppDispatch>()
