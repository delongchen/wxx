import { memo, useEffect, useState } from 'react';
import { useNiumaContext } from '../context/hooks';
import { NiumaChartDataType, NiumaAnalyzeProps } from '../workers/analyze'
import { Box, Text } from '@chakra-ui/react';
import { Button } from '@/components/ui/button'
import { SummonerInfoWithoutReRoll } from 'tauri-plugin-wxx-core';
import { readLocalSummoners, readLocalMatches } from 'tauri-plugin-wxx-core/api';
import { useCurrentSummoner } from 'tauri-plugin-wxx-core/hooks'

interface NiumaDashboardProps {
  puuid: string
}

interface NiumaSelectorProps {
  onPuuidClick?: (puuid: string) => void;
}

function NiumaDashboard({ puuid }: NiumaDashboardProps) {
  const { invoke } = useNiumaContext();
  const [pending, setPending] = useState(true);
  const [chartData, setChartData] = useState<NiumaChartDataType | null>(null)

  useEffect(() => {
    const fn = async () => {
      const buf = await readLocalMatches(puuid)
        .catch(() => null);

      setPending(false);

      if (buf !== null) {
        const result = await invoke<NiumaChartDataType, NiumaAnalyzeProps>('analyze', {
          puuid,
          matchesBuffer: buf,
        })
        setChartData(result)
      }
    }

    fn()
  }, []);

  if (pending) {
    return (
      <Box>pending</Box>
    )
  }

  if (chartData === null) {
    return (
      <Box>no chart data</Box>
    )
  }

  return (
    <Box>{JSON.stringify(chartData)}</Box>
  )
}

function NiumaSelector({ onPuuidClick }: NiumaSelectorProps) {
  const { theme } = useNiumaContext();
  const [localSummoners, setLocalSummoners] = useState<SummonerInfoWithoutReRoll[]>([]);

  useEffect(() => {
    readLocalSummoners().then(setLocalSummoners);
  }, []);

  return (
    <Box>
      {localSummoners.map(summoner => (
        <Box key={summoner.puuid}>
          <Text>{summoner.gameName}#{summoner.tagLine}</Text>
          <Button
            colorPalette={theme}
            onClick={() => {
              onPuuidClick && onPuuidClick(summoner.puuid)
            }}
          >select</Button>
        </Box>
      ))}
    </Box>
  );
}

function NiumaPage() {
  const [activatingPuuid, setActivatingPuuid] = useState('')
  const currentSummoner = useCurrentSummoner()

  useEffect(() => {
    if (currentSummoner !== null && activatingPuuid === '') {
      setActivatingPuuid(currentSummoner.puuid)
    }
  }, [activatingPuuid, currentSummoner]);

  if (activatingPuuid === '') {
    return (
      <NiumaSelector onPuuidClick={setActivatingPuuid} />
    )
  }

  return (
    <NiumaDashboard puuid={activatingPuuid} />
  )
}

export default memo(NiumaPage);
