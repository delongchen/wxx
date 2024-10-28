import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '@/store';
import { createConfigHandle } from 'tauri-plugin-wxx-core';

const namespace = 'wxx-power';

interface WxxPowerState {
  autoAcceptMatch: boolean;
  autoNextMatch: boolean;
  autoBallot: boolean;
}

const configHandle = createConfigHandle<WxxPowerState>('wxx-power', 'tik-tok-helper');

const initialState: WxxPowerState = {
  autoAcceptMatch: false,
  autoNextMatch: false,
  autoBallot: false,
};

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

export const syncToLocalConfig =
  (afterSync?: (state: WxxPowerState) => void): AppThunk =>
    (dispatch) =>
      configHandle.readWithInit(initialState).then((state) => {
        if (afterSync !== undefined) afterSync(state);

        const keys = Object.keys(state) as (keyof WxxPowerState)[];

        for (const key of keys) {
          dispatch(
            setStateValue({
              key,
              value: state[key],
            }),
          );
        }
      });

export const setStateAsync =
  (cb: (prev: WxxPowerState) => Partial<WxxPowerState> | undefined): AppThunk =>
    async (dispatch) => {
      const prev = await configHandle.read();
      const changed = cb(prev);
      if (changed === undefined) return;

      const cur = await configHandle.write(changed);
      const changedKeys = Object.keys(changed) as (keyof WxxPowerState)[];
      for (const key of changedKeys) {
        dispatch(setStateValue({ key, value: cur[key] }));
      }
    };
