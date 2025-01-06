import type { NiumaChartDataType } from '../workers/types';
import { memo } from 'react'
import { Flex } from '@chakra-ui/react'


interface NiumaHighlightsProps {
  chartData: NiumaChartDataType;
}

function NiumaHighlights({ chartData }: NiumaHighlightsProps) {

  return (
    <Flex
      flexDirection="column"
      alignItems="center"
    >
    </Flex>
  )
}

export default memo(NiumaHighlights)
