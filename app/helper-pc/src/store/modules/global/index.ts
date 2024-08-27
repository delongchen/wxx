import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '@/store';
import { createConfigHandle } from 'tauri-plugin-wxx-core';

const namespace = 'global';

interface WxxAppConfig {
  theme: string;
}

const configHandle = createConfigHandle<WxxAppConfig>('app', 'app.config');

const initialWxxAppConfig: WxxAppConfig = {
  theme: 'gray',
};

export interface WxxGlobalState extends WxxAppConfig {
  isFullPage: boolean;
}

const initialState: WxxGlobalState = {
  ...initialWxxAppConfig,
  isFullPage: false,
};

const globalSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setGlobalTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
    },
    switchFullPage: (state, action) => {
      state.isFullPage = action.payload === true;
    },
  },
});

export const { switchFullPage, setGlobalTheme } = globalSlice.actions;

export const fetchLocalConfig = (): AppThunk => async dispatch => {
  const localConfig = await configHandle.readWithInit(initialWxxAppConfig).catch(() => null);

  if (localConfig !== null) {
    dispatch(setGlobalTheme(localConfig.theme));
  }
};

export const setGlobalThemeAsync =
  (theme: string): AppThunk =>
  async dispatch => {
    const config = await configHandle.write({ theme });

    if (config !== null) {
      dispatch(setGlobalTheme(config.theme));
    }
  };

export const selectGlobal = (state: RootState) => state.global;
export default globalSlice.reducer;
