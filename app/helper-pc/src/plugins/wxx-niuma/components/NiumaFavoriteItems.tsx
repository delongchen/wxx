import type { SummonerInfoWithoutReRoll } from 'tauri-plugin-wxx-core';
import type { NiumaChartDataType } from '@/plugins/wxx-niuma/workers/types';
import { Avatar } from '@/components/ui/avatar';
import { Flex, Text } from '@chakra-ui/react';
import { Suspense, use } from 'react'
import { LolContext } from '../context/lol'

interface NiumaFavoriteItemsProps {
  mainSummoner: SummonerInfoWithoutReRoll;
  chartData: NiumaChartDataType;
}

const getItemPNGSrc = (id: number, version: string = '14.22.1') => {
  return `https://ddragon.leagueoflegends.com/cdn/${version}/img/item/${id}.png`;
};

function NiumaFavoriteItems({ chartData }: NiumaFavoriteItemsProps) {
  const { championsPromise } = use(LolContext)
  const { version } = use(championsPromise);
  const matchLen = chartData.dataVecMap['creation'].length;
  const { all } = chartData.state['items'] as {
    versions: [string, [number, number][]][],
    all: [number, number][],
  };

  return (
    <Suspense fallback={null}>
      <Flex justifyContent="space-evenly" alignItems="center" pt="2">
        {all.slice(0, 10).map(([id, count]) => (
          <Flex key={id} flexDirection="column" alignItems="center">
            <Avatar
              name={id + ''}
              src={getItemPNGSrc(id, version)}
              shape="square"
              size="xl"
            />
            <Text>{(100 * count / matchLen) << 0}%</Text>
          </Flex>
        ))}
      </Flex>
    </Suspense>
  );
}

export default NiumaFavoriteItems;
