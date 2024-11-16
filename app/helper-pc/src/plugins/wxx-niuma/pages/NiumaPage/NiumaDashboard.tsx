import { memo, useCallback, useEffect, useState } from 'react';
import { useNiumaContext } from '@/plugins/wxx-niuma/context/hooks.ts';
import { NiumaAnalyzeProps, NiumaChartDataType } from '../../workers/types';
import { readLocalMatches } from 'tauri-plugin-wxx-core/api';
import { Box } from '@chakra-ui/react';

interface NiumaDashboardProps {
  puuid: string;
}

const useNiumaChartData = (puuid: string) => {
  const { invoke } = useNiumaContext();
  const [pending, setPending] = useState(false);
  const [chartData, setChartData] = useState<NiumaChartDataType | null>(null);

  const refresh = useCallback(() => {
    if (pending || puuid === '') return;

    const task = async () => {
      const dataBuffer = await readLocalMatches(puuid)
        .catch(() => null);

      if (dataBuffer !== null) {
        const parsed = await invoke<NiumaChartDataType, NiumaAnalyzeProps>('analyze', {
          puuid,
          matchesBuffer: dataBuffer,
        }).catch(() => null);

        setChartData(parsed);
      }
    };

    setPending(true);
    task().finally(() => setPending(false));
  }, [puuid]);

  useEffect(refresh, []);

  return {
    pending,
    chartData,
    refresh,
  };
};

const PendingContent = (
  <div>pending</div>
);

function NiumaDashboard({ puuid }: NiumaDashboardProps) {
  const { pending, chartData } = useNiumaChartData(puuid);

  if (pending) return PendingContent;

  if (chartData === null) {
    return (
      <Box>no data</Box>
    );
  }

  return (
    <Box></Box>
  );
}

export default memo(NiumaDashboard);
