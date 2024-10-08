import { Box, Button, Text } from '@chakra-ui/react';
import { useCurrentSummoner } from 'tauri-plugin-wxx-core/hooks';
import { fetch_match_history } from 'tauri-plugin-wxx-core/lcu-api/match-history'
import { useCallback, useState } from 'react';


function NoSummoner() {
  return <div>start lol first</div>;
}

function HistoryFetchPage() {
  const currentSummoner = useCurrentSummoner();
  const [message, setMessage] = useState<string>('');

  const handleClick = useCallback(() => {
    if (currentSummoner !== null) {
      fetch_match_history()
        .then(data => {
          setMessage(JSON.stringify(data));
        })
    }
  }, [currentSummoner]);

  return (
    <Box p="2">
      {currentSummoner !== null ? (
        <>
          <Button onClick={handleClick}>fetch history</Button>
          <Text>{message}</Text>
        </>
      ) : (
        <NoSummoner />
      )}
    </Box>
  );
}

export default HistoryFetchPage;
