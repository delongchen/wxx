import { Grid, Text, Flex } from '@chakra-ui/react';
import type { NiumaChartDataType, PlayerTuple } from '../workers/types';
import { decodePlayerTuple } from '@/plugins/wxx-niuma/workers/analyze/tasks/utils.ts';
import PlayerPersona from '../components/PlayerPersona.tsx';
import ContentCard from '../components/ContentCard.tsx';

interface NiumaTeammatesProps {
  chartData: NiumaChartDataType;
}

function NiumaTeammates(props: NiumaTeammatesProps) {
  const { chartData } = props;
  const teammateTuples = chartData.state['teammates'] as [string, number, number][] ?? [];

  if (teammateTuples.length === 0) {
    return (
      <ContentCard>
        <Text textAlign="center">朋友是游戏的最高配置</Text>
      </ContentCard>
    );
  }

  teammateTuples.sort((a, b) => b[1] - a[1]);
  const maxCountMate = teammateTuples[0];

  teammateTuples.sort((a, b) => ((b[2] / b[1]) - (a[2] / a[1])));
  const maxWinRateMate = teammateTuples[0];
  const minWinRateMate = teammateTuples[teammateTuples.length - 1];

  const playerTuples = chartData.state['players'] as PlayerTuple[];
  const playerMap = new Map(
    playerTuples
      .map(decodePlayerTuple)
      .map(player => [player.puuid, player]),
  );

  const items = [
    {
      title: '最熟悉的队友',
      mate: maxCountMate,
      desc: '肯定是WXX',
    },
    {
      title: '最佳战友',
      mate: maxWinRateMate,
      desc: '收徒',
    },
    {
      title: '最牛马队友',
      mate: minWinRateMate,
      desc: '要不歇了?',
    },
  ];

  return (
    <Grid templateColumns="repeat(3, 1fr)" m="4">
      {items.map(({ title, mate, desc }, index) => {
        const player = playerMap.get(mate[0]);
        if (player === undefined) return null;

        const winRate = (100 * mate[2] / mate[1]) << 0;
        const winRateColor = winRate === 50 ? 'blue'
          :
          winRate < 50 ? 'red' : 'green';

        return (
          <ContentCard key={index}>
            <Flex flexDirection="column" alignItems="center">
              <Text textStyle="xl">{title}</Text>
              <PlayerPersona
                profileIcon={player.profileIcon}
                gameName={player.gameName}
                tagLine={player.tagLine}
              />
              <Text>{mate[1]}场
                胜率<span style={{ color: winRateColor }}>{winRate}</span>%
              </Text>
              <Text color="fg.muted" textStyle="sm">{desc}</Text>
            </Flex>
          </ContentCard>
        );
      })}
    </Grid>
  );
}

export default NiumaTeammates;
