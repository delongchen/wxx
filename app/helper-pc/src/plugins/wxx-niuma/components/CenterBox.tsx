import { PropsWithChildren } from 'react';
import { Box } from '@chakra-ui/react';

function CenterBox({ children }: PropsWithChildren) {
  return (
    <Box
      pos='absolute'
      left='50%'
      top='50%'
      transform='translate(-50%, -50%)'
    >{children}</Box>
  )
}

export default CenterBox
