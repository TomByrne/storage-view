
import { ContextState } from './types';
import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';

const initialState: ContextState = {
    element: undefined,
    job: undefined,
    node: undefined,
}


export const contextSlice = createSlice({
    name: 'context',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        "set": (state, action) => {
            state.element = action.payload.element;
            state.job = action.payload.job;
            state.node = action.payload.node;
        },
        "clear": (state, action) => {
            state.element = undefined;
            state.job = undefined;
            state.node = undefined;
        },
    },
});

export const selectContext = (state: RootState) => state.context;

export default contextSlice.reducer;

