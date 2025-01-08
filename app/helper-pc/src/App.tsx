import WxxLayout from '@/layouts/AppLayout/WxxLayout.tsx';
import { memo } from 'react';
import AppProvider from '@/app/context/provider.tsx';

function App() {
  return (
    <AppProvider>
      <WxxLayout />
    </AppProvider>
  );
}

export default memo(App);
