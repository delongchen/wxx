import { useNiumaContext } from '@/plugins/wxx-niuma/context/hooks';
import { useEffect, useState, memo } from 'react';
import { readLocalSummoners, SummonerInfoWithoutReRoll } from 'tauri-plugin-wxx-core';
import { Box, Text } from '@chakra-ui/react';
import { Button } from '@/components/ui/button.tsx';

interface NiumaSelectorProps {
  onPuuidClick?: (puuid: string) => void;
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
              onPuuidClick && onPuuidClick(summoner.puuid);
            }}
          >select</Button>
        </Box>
      ))}
    </Box>
  );
}

export default memo(NiumaSelector);
