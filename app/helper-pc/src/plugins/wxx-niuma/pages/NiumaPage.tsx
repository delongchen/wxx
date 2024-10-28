import { memo } from 'react';
import { useNiumaContext } from '../context/hooks';
import { Box } from '@chakra-ui/react';

function NiumaPage() {
  const { theme } = useNiumaContext();

  return (
    <Box p="2">
      {theme}
    </Box>
  );
}

export default memo(NiumaPage);
