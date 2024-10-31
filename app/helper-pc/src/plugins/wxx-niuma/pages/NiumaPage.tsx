import { memo, useEffect, useState } from 'react';
import { useNiumaContext } from '../context/hooks';
import { Box, Text } from '@chakra-ui/react';
import { SummonerInfoWithoutReRoll } from 'tauri-plugin-wxx-core';
import { readLocalSummoners } from 'tauri-plugin-wxx-core/api';

interface NiumaDashboardProps {

}

interface NiumaListProps {
  summoners: SummonerInfoWithoutReRoll[];
}

function NiumaDashboard(props: NiumaDashboardProps) {

}

function NiumaList({ summoners }: NiumaListProps) {
  return (
    <Box>
      {summoners.map(summoner => (
        <div key={summoner.puuid}>{summoner.gameName}</div>
      ))}
    </Box>
  );
}

function NiumaPage() {
  const { theme } = useNiumaContext();
  const [localSummoners, setLocalSummoners] = useState<SummonerInfoWithoutReRoll[]>([]);
  const [activatingPuuid, setActivatingPuuid] = useState('')

  useEffect(() => {
    readLocalSummoners().then(setLocalSummoners);
    setActivatingPuuid('')
  }, []);

  if (activatingPuuid === '') {
    return <NiumaList summoners={localSummoners} />
  }

  return (
    <Box p="2">
      <Text>Theme: {theme}</Text>
    </Box>
  );
}

export default memo(NiumaPage);
