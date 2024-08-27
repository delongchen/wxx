import { configureStore, combineSlices, ThunkAction, Action, Reducer } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useSelector, useDispatch } from 'react-redux';
import { thunk } from 'redux-thunk';

import global from './modules/global';
import wxxPower from './modules/wxx-power';

const innerSlices = {
  global,
  wxxPower,
};

const outerSlices: Record<string, Reducer> = {};

const initReducer = combineSlices({
  global,
  wxxPower,
});

const store = configureStore({
  reducer: initReducer,
  middleware: getDefaultMiddleware => {
    return getDefaultMiddleware().concat(thunk);
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export type AppThunk<R = void> = ThunkAction<R, RootState, unknown, Action<string>>;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// const addSlice = () => {}
export const updateStore = () => {
  store.replaceReducer(combineSlices(innerSlices, outerSlices));
};

export default store;
