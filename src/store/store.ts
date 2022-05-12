import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import jobsReducer from './jobsSlice';
import contextReducer from './contextSlice';

export const store = configureStore({
  reducer: {
    jobs: jobsReducer,
    context: contextReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck : false,
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
