import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '@/store';
import { createConfigHelper } from '@/utils/config-helper.ts';

const namespace = 'wxx_power';

interface WxxPowerState {
  autoAcceptMatch: boolean;
  autoNextMatch: boolean;
  autoBallot: boolean;
}

const initialState: WxxPowerState = {
  autoAcceptMatch: false,
  autoNextMatch: false,
  autoBallot: false,
} as const;

const wxxPowerSlice = createSlice({
  name: namespace,
  initialState,
  reducers: {
    setStateValue: <K extends keyof WxxPowerState>(
      state: WxxPowerState,
      action: PayloadAction<{
        key: K;
        value: WxxPowerState[K];
      }>,
    ) => {
      state[action.payload.key] = action.payload.value;
    },
  },
});

export const { setStateValue } = wxxPowerSlice.actions;

export const selectWxxPower = (state: RootState) => state.wxxPower;
export default wxxPowerSlice.reducer;

const configHelper = createConfigHelper('plugins')
const { transaction } = configHelper.open(namespace, () => initialState)

export const syncConfig = (
  afterSync?: (state: WxxPowerState) => void
): AppThunk => async (dispatch) => {
  await transaction(({ peek }) => {
    const config = peek()

    for (const key of Object.keys(config) as (keyof WxxPowerState)[]) {
      dispatch(setStateValue({ key, value: config[key] }))
    }

    afterSync && afterSync(config)
  })
}

export const setStateAsync = (
  cb: (prev: WxxPowerState) => Partial<WxxPowerState>
): AppThunk => async (dispatch) => {
  await transaction(({ peek, add }) => {
    add(cb(peek()))
  }).then(() => {
    dispatch(syncConfig())
  })
};
