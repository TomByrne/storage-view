
import { DevState } from './types';
import { createSlice } from '@reduxjs/toolkit';
import { invoke } from '@tauri-apps/api/tauri'
import { RootState } from '../store';

const initialState: DevState = {
    devtools_shown: false,
}


export const devSlice = createSlice({
    name: 'dev',
    initialState,
    // The `reducers` field lets us define reducers and generate associated actions
    reducers: {
        "set-devtools-shown": (state, action) => {
            state.devtools_shown = action.payload.shown;
            invoke('show_devtools', { shown: state.devtools_shown }); // Call out to rust
        },
    },
});

export const selectDevtoolsShown = (state: RootState) => state.dev.devtools_shown;

export default devSlice.reducer;

