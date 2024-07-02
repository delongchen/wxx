import { create } from 'zustand';
import { LcuClientStateType } from '../constant';
import { LcuClient, SubcriptionType } from '../../../../plugins/wxx-core/dist-js';

export type LcuClientStatus = {
  lcuClientState: LcuClientStateType;
  setLcuClientState: (state: LcuClientStateType) => void;
};

export const useLcuClientStore = create<LcuClientStatus>((set) => ({
  lcuClientState: LcuClientStateType.Connecting,
  setLcuClientState: (state: LcuClientStateType) =>
    set({ lcuClientState: state }),
}));

const _getUnlisten = LcuClient.listen(({ payload }) => {
  const { subscription_type, data, event_type } = payload;
  if (
    subscription_type === SubcriptionType.LcuClient &&
    event_type === 'connect' &&
    data
  ) {
    const setStatus = useLcuClientStore((state) => state.setLcuClientState);
    setStatus(LcuClientStateType.Connected);
    _getUnlisten.then((unlisten) => unlisten());
  }
});
