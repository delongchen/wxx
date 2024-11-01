import { memo, useCallback, useEffect, useState } from 'react';
import { useNiumaContext } from '../context/hooks';
import { Box, Text } from '@chakra-ui/react';
import { Button } from '@/components/ui/button'
import { SummonerInfoWithoutReRoll } from 'tauri-plugin-wxx-core';
import { readLocalSummoners, readLocalMatches } from 'tauri-plugin-wxx-core/api';

interface NiumaDashboardProps {

}

interface NiumaListProps {
  summoners: SummonerInfoWithoutReRoll[];
  onPuuidClick?: (puuid: string) => void;
}

function NiumaDashboard(props: NiumaDashboardProps) {

}

function NiumaList({ summoners, onPuuidClick }: NiumaListProps) {
  return (
    <Box>
      {summoners.map(summoner => (
        <div key={summoner.puuid}>
          <Text>{summoner.gameName}#{summoner.tagLine}</Text>
          <Button onClick={() => {
            onPuuidClick && onPuuidClick(summoner.puuid)
          }}>select</Button>
        </div>
      ))}
    </Box>
  );
}

function NiumaPage() {
  const { theme, invoke } = useNiumaContext();
  const [localSummoners, setLocalSummoners] = useState<SummonerInfoWithoutReRoll[]>([]);
  const [activatingPuuid, setActivatingPuuid] = useState('')

  useEffect(() => {
    readLocalSummoners().then(setLocalSummoners);
  }, []);

  const handleClick = useCallback(() => {
    if (activatingPuuid !== '') {
      readLocalMatches(activatingPuuid)
        .then(buf => {
          return invoke('parse', buf)
        })
        .then(console.log)
    }
  }, [activatingPuuid])

  const handlePuuidChange = useCallback((puuid: string) => {
    setActivatingPuuid(puuid);
  }, [])

  if (activatingPuuid === '') {
    return <NiumaList
      summoners={localSummoners}
      onPuuidClick={handlePuuidChange}
    />
  }

  return (
    <Box p="2">
      <Text>Puuid: {activatingPuuid}</Text>
      <Button onClick={handleClick} colorPalette={theme}>read</Button>
    </Box>
  );
}

export default memo(NiumaPage);
