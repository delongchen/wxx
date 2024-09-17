import { useContext } from 'react'
import { Box } from '@chakra-ui/react'
import { NiumaContext } from './context'


function MyNiuma() {
  const { summoner } = useContext(NiumaContext)

  return (
    <Box>{summoner && (
      JSON.stringify(summoner, null, 2)
    )}</Box>
  )
}

export default MyNiuma;
