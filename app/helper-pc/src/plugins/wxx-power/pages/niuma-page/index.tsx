import { memo, PropsWithChildren, useCallback, useState } from 'react';
import { Box } from '@chakra-ui/react';
import Style from './index.module.sass';
import NiumaHeader from './NiumaHeader.tsx';
import NiumaContent from './NiumaContent.tsx';
import NiumaRank from './NiumaRank.tsx';
import MyNiuma from './MyNiuma.tsx';
import { NiumaContext } from './context';
import { useAppSelector } from '@/store';
import { selectGlobal } from '@/store/modules/global';
import { useCurrentSummoner } from '../../hooks/common';

const NiumaComponentKeys: { key: string; text: string }[] = [
  { key: 'niuma', text: '🐂🐎' },
  { key: 'self', text: '个人战绩' },
] as const;

const NiumaProvider = ({ children }: PropsWithChildren) => {
  const { theme } = useAppSelector(selectGlobal);
  const summoner = useCurrentSummoner();

  return <NiumaContext.Provider value={{ theme, summoner }}>{children}</NiumaContext.Provider>;
};

function NiumaPage() {
  const [activeKey, setActiveKey] = useState('niuma');

  const handleHeaderClick = useCallback((key: string) => {
    setActiveKey(key);
  }, []);

  return (
    <NiumaProvider>
      <Box className={Style.container}>
        <NiumaHeader
          items={NiumaComponentKeys}
          activeKey={activeKey}
          onButtonClick={handleHeaderClick}
        />
        <NiumaContent>{activeKey === 'niuma' ? <NiumaRank /> : <MyNiuma />}</NiumaContent>
      </Box>
    </NiumaProvider>
  );
}

export default memo(NiumaPage);
