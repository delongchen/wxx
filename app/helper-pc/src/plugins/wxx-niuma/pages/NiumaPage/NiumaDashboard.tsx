import { memo, PropsWithChildren } from 'react';
import { Box, Text, Flex } from '@chakra-ui/react';
import type { SummonerInfoWithoutReRoll } from 'tauri-plugin-wxx-core';
import { useNiumaChartData } from '../../context/hooks';
import DailyGameChart from '../../components/charts/DailyGameChart.tsx';
import NiumaOverview from '../../components/NiumaOverview.tsx';
import NiumaTeammates from '../../components/NiumaTeammates.tsx';
import NiumaFavoriteItems from '../../components/NiumaFavoriteItems.tsx';
import NiumaHighlights from '../../components/NiumaHighlights.tsx';
import ContentCard from '../../components/ContentCard.tsx';
import NiumaChampionUsage from '../../components/NiumaChampionUsage.tsx'


interface NiumaDashboardProps {
  summoner: SummonerInfoWithoutReRoll;
}

type ComponentTitleProps = PropsWithChildren<{
  text: string;
  sub?: string;
}>

const ComponentTitle = ({ text, sub }: ComponentTitleProps) => {
  return (
    <Flex
      mt='16'
      flexDirection='column'
      alignItems='center'
    >
      <Text textStyle='2xl'>{text}</Text>
      {sub && (
        <Text textStyle='xl' color="fg.muted">{sub}</Text>
      )}
    </Flex>
  );
};

function NiumaDashboard({ summoner }: NiumaDashboardProps) {
  const { puuid } = summoner;
  const { pending, chartData } = useNiumaChartData(puuid);

  if (pending) return (
    <div>pending</div>
  );

  if (chartData === null) return (
    <Box>no data</Box>
  );

  return (
    <>
      <ContentCard>
        <NiumaOverview chartData={chartData} mainSummoner={summoner} />
      </ContentCard>

      <ComponentTitle text="牛马兄弟" />
      <NiumaTeammates chartData={chartData} />

      <ComponentTitle text="牛马作息表" />
      <ContentCard>
        <DailyGameChart tuples={chartData.state['daily'] as [string, number, number][]} />
      </ContentCard>

      <ComponentTitle text="牛马最爱的装备" />
      <ContentCard>
        <NiumaFavoriteItems mainSummoner={summoner} chartData={chartData} />
      </ContentCard>

      <ComponentTitle text="牛马英雄榜" sub='sssssss'/>
      <ContentCard>
        <NiumaChampionUsage chartData={chartData} />
      </ContentCard>

      <ComponentTitle text='牛马高光时刻' sub='和最摆时刻' />
      <ContentCard>
        <NiumaHighlights chartData={chartData} />
      </ContentCard>
    </>
  );
}

export default memo(NiumaDashboard);
