import { memo, PropsWithChildren } from 'react';
import Style from './NiumaContent.module.sass'
import { Box } from '@chakra-ui/react'


type NiumaContentProps = PropsWithChildren<{
  theme?: string
}>

function NiumaContent(props: NiumaContentProps) {
  const {
    theme = 'gary'
  } = props

  const bg = [theme, 100].join('.')

  return (
    <Box
      className={Style.container}
      bg={bg}
    >{props.children}</Box>
  )
}

export default memo(NiumaContent)
