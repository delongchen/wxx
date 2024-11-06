import { Box, Button } from '@chakra-ui/react';
import { useCurrentSummoner } from 'tauri-plugin-wxx-core/hooks';
import { createMatchHistoryFetchingTask } from 'tauri-plugin-wxx-core/api';
import { useCallback } from 'react';
import MHFTaskList from '../components/MHFTaskList.tsx';


function NoSummoner() {
  return <div>start lol first</div>;
}

function HistoryFetchPage() {
  const currentSummoner = useCurrentSummoner();

  const handleClick = useCallback(() => {
    if (currentSummoner !== null) {
      createMatchHistoryFetchingTask(currentSummoner.puuid, console.error);
    }
  }, [currentSummoner]);

  if (currentSummoner === null) {
    return <NoSummoner />;
  }

  return (
    <Box p="2">
      <Button onClick={handleClick}>fetch history</Button>
      <MHFTaskList />
    </Box>
  );
}

export default HistoryFetchPage;
