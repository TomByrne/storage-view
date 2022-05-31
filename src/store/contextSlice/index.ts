
import { createSlice } from '@reduxjs/toolkit';
import { RootState } from '../store';
import { ContextState } from './types';

const initialState: ContextState = {
    element: undefined,
    job: undefined,
    node: undefined,
    x: 0,
    y: 0,
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
            state.x = action.payload.x;
            state.y = action.payload.y;
        },
        "clear": (state, action) => {
            state.element = undefined;
            // state.job = undefined;
            // state.node = undefined;
        },
    },
});

export const selectContext = (state: RootState) => state.context;

export default contextSlice.reducer;

