import WxxLayout from '@/layouts/AppLayout/WxxLayout.tsx';
import { memo, useEffect } from 'react';
import { useAppDispatch } from '@/store';
import { fetchLocalConfig } from '@/store/modules/global';

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchLocalConfig());
  }, []);

  return <WxxLayout />;
}

export default memo(App);
