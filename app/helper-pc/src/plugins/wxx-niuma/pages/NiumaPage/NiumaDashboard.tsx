import { memo } from 'react';
import { Box, Text } from '@chakra-ui/react';
import { useNiumaChartData } from '../../context/hooks';
import DailyGameChart from '../../components/charts/DailyGameChart.tsx';
import NiumaTeammates from '../../components/NiumaTeammates.tsx';
import ContentCard from '../../components/ContentCard.tsx';

interface NiumaDashboardProps {
  puuid: string;
}

function NiumaDashboard({ puuid }: NiumaDashboardProps) {
  const { pending, chartData } = useNiumaChartData(puuid);

  if (pending) return (
    <div>pending</div>
  );

  if (chartData === null) return (
    <Box>no data</Box>
  );

  return (
    <>
      <Text textStyle='2xl' textAlign='center'>队友榜</Text>
      <NiumaTeammates chartData={chartData} />

      <Text textStyle='2xl' textAlign='center'>牛马作息表</Text>
      <ContentCard>
        <DailyGameChart tuples={chartData.state['daily'] as [string, number, number][]} />
      </ContentCard>
    </>
  );
}

export default memo(NiumaDashboard);
