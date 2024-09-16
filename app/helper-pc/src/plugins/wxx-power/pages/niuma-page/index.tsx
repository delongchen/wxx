import { memo, useCallback, useState } from 'react';
import { Box } from '@chakra-ui/react';
import Style from './index.module.sass'
import NiumaHeader from './NiumaHeader.tsx';
import NiumaContent from './NiumaContent.tsx'
import NiumaRank from './NiumaRank.tsx';
import { useAppSelector } from '@/store';
import { selectGlobal } from '@/store/modules/global';


const NiumaComponentKeys: {key: string, text: string}[] = [
  { key: 'niuma', text: '🐂🐎' },
  { key: 'self', text: '个人战绩' },
] as const;

function NiumaPage() {
  const { theme } = useAppSelector(selectGlobal);
  const [activeKey, setActiveKey] = useState('niuma');

  const handleHeaderClick = useCallback((key: string) => {
    setActiveKey(key)
  }, [])

  return (
    <Box className={Style.container}>
      <NiumaHeader
        theme={theme}
        items={NiumaComponentKeys}
        activeKey={activeKey}
        onButtonClick={handleHeaderClick}
      />
      <NiumaContent theme={theme}>
        {activeKey === 'niuma' ? (
          <NiumaRank />
        ) : (
          <div>self</div>
        )}
      </NiumaContent>
    </Box>
  );
}

export default memo(NiumaPage);
