import { memo, PropsWithChildren, useContext } from 'react';
import Style from './NiumaContent.module.sass'
import { Box } from '@chakra-ui/react'
import { NiumaContext } from './context';


function NiumaContent({ children }: PropsWithChildren) {
  const { theme } = useContext(NiumaContext);
  const bg = [theme, 100].join('.')

  return (
    <Box
      className={Style.container}
      bg={bg}
    >{children}</Box>
  )
}

export default memo(NiumaContent)
