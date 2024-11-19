import { memo, PropsWithChildren } from 'react';
import { Box, Text } from '@chakra-ui/react';
import type { SummonerInfoWithoutReRoll } from 'tauri-plugin-wxx-core';
import { useNiumaChartData } from '../../context/hooks';
import DailyGameChart from '../../components/charts/DailyGameChart.tsx';
import NiumaOverview from '../../components/NiumaOverview.tsx';
import NiumaTeammates from '../../components/NiumaTeammates.tsx';
import NiumaFavoriteItems from '../../components/NiumaFavoriteItems.tsx';
import ContentCard from '../../components/ContentCard.tsx';

interface NiumaDashboardProps {
  summoner: SummonerInfoWithoutReRoll;
}

const ComponentTitle = ({ text }: PropsWithChildren<{ text: string }>) => {
  return (
    <Text
      textStyle="2xl"
      textAlign="center"
      mt='16'
    >{text}</Text>
  )
}

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

      <ComponentTitle text='牛马最爱的装备' />
      <ContentCard>
        <NiumaFavoriteItems mainSummoner={summoner} chartData={chartData} />
      </ContentCard>

      <ComponentTitle text='牛马兄弟' />
      <NiumaTeammates chartData={chartData} />

      <ComponentTitle text='牛马作息表' />
      <ContentCard>
        <DailyGameChart tuples={chartData.state['daily'] as [string, number, number][]} />
      </ContentCard>
    </>
  );
}

export default memo(NiumaDashboard);
