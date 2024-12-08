import type { NiumaChartDataType } from '../workers/types';
import type { SummonerInfoWithoutReRoll } from 'tauri-plugin-wxx-core';
import PlayerPersona from './PlayerPersona.tsx';
import { Flex, Text } from '@chakra-ui/react';
import { formatTimestamp } from '../workers/analyze/tasks/utils';

interface NiumaOverviewProps {
  mainSummoner: SummonerInfoWithoutReRoll;
  chartData: NiumaChartDataType;
}

function NiumaOverview({ chartData, mainSummoner }: NiumaOverviewProps) {
  const { creation } = chartData.dataVecMap;
  const matchesNum = creation.length;
  const latestCreation = creation[matchesNum - 1];

  const items = [
    {
      key: 'latest-game',
      title: '数据截止于',
      content: formatTimestamp(latestCreation),
    },
    {
      key: 'game-count',
      title: 'dld场数',
      content: matchesNum,
    },
  ];

  return (
    <>
      <Flex>
        <PlayerPersona
          profileIcon={mainSummoner.profileIconId}
          gameName={mainSummoner.gameName}
          tagLine={mainSummoner.tagLine}
        />
        <Flex justifyContent="space-around" flex="1">
          {items.map(({ key, title, content }) => (
            <Flex
              key={key}
              flexDirection="column"
              alignItems="center"
              justifyContent="space-around"
            >
              <Text textStyle="xl">{title}</Text>
              <Text>{content}</Text>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </>
  );
}

export default NiumaOverview;