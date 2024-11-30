import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '@/store';
import { createConfigHelper } from '@/utils/config-helper';

const namespace = 'global';

interface WxxAppConfig {
  theme: string;
}

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

const configHelper = createConfigHelper('app');
const { transaction } = configHelper.open(namespace, () => initialWxxAppConfig)

export const fetchLocalConfig = (): AppThunk => async (dispatch) => {
  await transaction(({ peek }) => {
    dispatch(setGlobalTheme(peek().theme))
  })
};

export const setGlobalThemeAsync = (theme: string): AppThunk => async (dispatch) => {
  await transaction(({ add }) => {
    add({ theme })
  }).then(() => {
    dispatch(setGlobalTheme(theme));
  })
};

export const selectGlobal = (state: RootState) => state.global;
export default globalSlice.reducer;
