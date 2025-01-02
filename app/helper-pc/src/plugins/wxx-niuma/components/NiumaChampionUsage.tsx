import type { NiumaChartDataType } from '../workers/types';
import { useNiumaContext } from '../context/hooks';
import { ChampionComplex, LolChampionRaw } from '../api/dragon';
import { memo } from 'react';
import { Box, Flex, Text } from '@chakra-ui/react';

interface NiumaChampionUsageProps {
  chartData: NiumaChartDataType;
}

interface ChampionCardProps {
  champion: LolChampionRaw
  title?: string
  subTitle?: string
}

type ChampionUsageTuple = [number, number, number]

const makeChampionIndex = ({ data }: ChampionComplex) => {
  const result: Record<number, LolChampionRaw> = {}

  for (const champion of Object.values(data)) {
    result[+champion.key] = champion;
  }

  return result;
}

function sortAndMostLeast<T>(tuples: T[], compareFn: (a: T, b: T) => number): [T, T, T[]] {
  tuples.sort(compareFn)

  return [tuples[0], tuples[tuples.length - 1], tuples]
}

const calculateValue = ([, total, win]: ChampionUsageTuple, maxTotal: number, minTotal: number): number => {
  const rate = win / total
  const normalizedTotal = (total - minTotal) / (maxTotal - minTotal)
  return 0.35 * normalizedTotal + 0.65 * rate
}

const ChampionCard = ({ champion, title, subTitle }: ChampionCardProps) => {
  const imgUrl = `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${champion.id}_0.jpg`
  return (
    <Box position="relative">
      <img src={imgUrl} alt={champion.name} />
      <Flex
        position="absolute"
        left="50%"
        bottom="0"
        transform="translateX(-50%)"
        flexDirection="column"
        alignItems="center"
      >
        <Text color='white'>{champion.name}</Text>
        {title && (
          <Text textStyle='2xl' color='white'>{title}</Text>
        )}
        {subTitle && (
          <Text color='fg.subtle'>{subTitle}</Text>
        )}
      </Flex>
    </Box>
  )
}

function NiumaChampionUsage({ chartData }: NiumaChampionUsageProps) {
  const { champions } = useNiumaContext();

  if (champions === null) {
    return null
  }

  const { state } = chartData
  const championUsage = (state['championUsage'] as [number, number, number][])
    .filter(it => it[1] > 2)

  if (championUsage.length === 0) {
    return (
      <></>
    )
  }

  const championMap = makeChampionIndex(champions)
  const [maxTotal, minTotal] = sortAndMostLeast(championUsage.map(it => it[1]), (a, b) => b - a)
  const [mostSelected] = sortAndMostLeast(championUsage, (a, b) => b[1] - a[1])
  const [mostValue, leastValue] = sortAndMostLeast(championUsage, (a, b) => {
    return calculateValue(b, maxTotal, minTotal) - calculateValue(a, maxTotal, minTotal)
  })

  const renderCard = (tuple: ChampionUsageTuple, title: string) => {
    const champion = championMap[tuple[0]]
    if (champion === undefined) return null

    const sub = `${(100 * tuple[2] / tuple[1]) << 0}% / ${tuple[1]}场次`

    return (
      <ChampionCard champion={champion} title={title} subTitle={sub} />
    )
  }

  return (
    <>
      <Flex justifyContent="space-around">
        {renderCard(mostSelected, '最爱英雄')}
        {renderCard(mostValue, '最有价值英雄')}
        {renderCard(leastValue, '最废英雄')}
      </Flex>
    </>
  )
}

export default memo(NiumaChampionUsage);
