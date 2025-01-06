import { Box } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

function ContentCard({ children }: PropsWithChildren) {

  return (
    <Box
      p="2"
      m="4"
      bg="white"
      borderRadius="12px"
    >
      {children}
    </Box>
  );
}

export default ContentCard;