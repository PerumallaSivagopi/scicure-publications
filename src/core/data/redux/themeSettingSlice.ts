import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  dataTheme: 'light',
}

const themeSettingSlice = createSlice({
  name: 'themeSetting',
  initialState,
  reducers: {
    setDataTheme: (state, action) => {
      const themeValue = action.payload === 'dark' ? 'dark' : 'light'
      document.documentElement.setAttribute('data-theme', themeValue)
      state.dataTheme = themeValue
    },
  },
})

export const { setDataTheme } = themeSettingSlice.actions
export default themeSettingSlice.reducer