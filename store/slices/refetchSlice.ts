import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../store'

export interface RefetchState {
    flag: boolean
}

const initialState: RefetchState = {
    flag: false,
}

export const refetchSlice = createSlice({
    name: 'refetch',
    initialState,
    reducers: {
        setRefetch: (state) => {
            state.flag = !state.flag;
        },
    },
})

// Action creators are generated for each case reducer function
export const { setRefetch } = refetchSlice.actions

// Other code such as selectors can use the imported `RootState` type
export const selectRefetch = (state: RootState) => state.refetch.flag

export default refetchSlice.reducer