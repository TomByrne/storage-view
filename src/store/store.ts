import { Action, configureStore, ThunkAction } from '@reduxjs/toolkit';
import contextReducer from './contextSlice';
import devReducer from './devSlice';
import jobsReducer from './jobsSlice';

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    context: contextReducer,
    dev: devReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
