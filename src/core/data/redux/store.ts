import { configureStore } from '@reduxjs/toolkit'
import sidebarSlice from './sidebarSlice'
import themeSettingSlice from './themeSettingSlice'

export const store = configureStore({
  reducer: {
    sidebarSlice,
    themeSetting: themeSettingSlice,
  },
  devTools: true,
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store  // ✅ Fix
