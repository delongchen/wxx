import { Box, SimpleGrid } from '@chakra-ui/react';
import React from 'react';
import { GameState } from '../../constant/game.ts';
import { useSummoners } from '../../hook/useSummoners.ts';
import { RecordTable } from './components/RecordTable.tsx';

export interface SummonerTableProps {
  state: GameState;
}

export const SummonerTable: React.FC<SummonerTableProps> = ({ state }) => {
  const { teams, enemies } = useSummoners(state);
  return (
    <SimpleGrid columns={2} spacing={10}>
      <Box>
        <RecordTable data={teams} />
      </Box>
      <Box>
        <RecordTable data={enemies} />
      </Box>
    </SimpleGrid>
  );
};
