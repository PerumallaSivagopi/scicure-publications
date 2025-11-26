import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  mobileSidebar: true,
}

const sidebarSlice = createSlice({
  name: 'sidebar',
  initialState,
  reducers: {
    setMobileSidebar: (state, action) => {
      state.mobileSidebar = action.payload
    },
  },
})

export const { setMobileSidebar } = sidebarSlice.actions
export default sidebarSlice.reducer