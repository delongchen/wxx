import { memo } from 'react';
import { Tabs, TabList, TabPanels, TabPanel, Tab } from '@chakra-ui/react';
import { useAppSelector } from '@/store';
import { selectGlobal } from '@/store/modules/global';
import SummonerList from './SummonerList.tsx';

function GroupPage() {
  const { theme } = useAppSelector(selectGlobal);

  return (
    <Tabs colorScheme={theme} isLazy>
      <TabList>
        <Tab>大厅</Tab>
        <Tab>动态</Tab>
        <Tab>设置</Tab>
      </TabList>

      <TabPanels>
        <TabPanel>
          <SummonerList />
        </TabPanel>
        <TabPanel>
          <p>two</p>
        </TabPanel>
        <TabPanel>
          <p>settings</p>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
}

export default memo(GroupPage);
