import { memo } from 'react';
import { Box } from '@chakra-ui/react';
import { useNiumaChartData } from '../../context/hooks'
import DailyGameChart from '../../components/charts/DailyGameChart.tsx';

interface NiumaDashboardProps {
  puuid: string;
}

function NiumaDashboard({ puuid }: NiumaDashboardProps) {
  const { pending, chartData } = useNiumaChartData(puuid);

  if (pending) return (
    <div>pending</div>
  )

  if (chartData === null) return (
    <Box>no data</Box>
  );

  return (
    <Box>
      <DailyGameChart tuples={chartData.state['daily'] as [string, number, number][]} />
    </Box>
  );
}

export default memo(NiumaDashboard);
