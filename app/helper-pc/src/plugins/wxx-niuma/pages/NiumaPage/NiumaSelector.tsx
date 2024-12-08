import { useNiumaContext } from '@/plugins/wxx-niuma/context/hooks';
import { useEffect, useState, memo } from 'react';
import { Flex, Grid, Text, Badge } from '@chakra-ui/react';
import { Button } from '@/components/ui/button.tsx';
import PlayerPersona from '../../components/PlayerPersona';
import ContentCard from '../../components/ContentCard.tsx';
import CenterBox from '../../components/CenterBox';
import { SummonerInfoWithoutReRoll } from 'tauri-plugin-wxx-core';

interface NiumaSelectorProps {
  onPuuidClick?: (summoner: SummonerInfoWithoutReRoll) => void;
}

function NiumaSelector({ onPuuidClick }: NiumaSelectorProps) {
  const { theme, currentSummoner } = useNiumaContext();
  const [localSummoners, setLocalSummoners] = useState<SummonerInfoWithoutReRoll[]>([]);

  useEffect(() => {
  }, []);

  if (localSummoners.length === 0) {
    return (
      <CenterBox>
        <Flex flexDirection="column" alignItems="center" justifyContent="space-between">
          <Text textStyle="2xl">人才库空空如也</Text>
          <Text>先去寻找牛马吧</Text>
        </Flex>
      </CenterBox>
    );
  }

  return (
    <Grid templateColumns="repeat(5, 1fr)">
      {localSummoners
        .sort((a, b) => {
          if (currentSummoner !== null && (
            a.puuid === currentSummoner.puuid || b.puuid === currentSummoner.puuid
          )) {
            return a.puuid === currentSummoner.puuid ? -1 : 1;
          }

          return b.summonerLevel - a.summonerLevel;
        })
        .map(summoner => (
          <ContentCard key={summoner.puuid}>
            <Flex
              alignItems="center"
              flexDirection="column"
            >
              <PlayerPersona
                profileIcon={summoner.profileIconId}
                gameName={summoner.gameName}
                tagLine={summoner.tagLine}
              />
              <Text mb="1">
                {currentSummoner !== null && summoner.puuid === currentSummoner.puuid ? (
                  <Badge
                    variant="solid"
                    colorPalette="green"
                    mr="1"
                  >当前登录</Badge>
                ) : null}
                LV.{summoner.summonerLevel}
              </Text>
              <Button
                colorPalette={theme}
                onClick={() => {
                  onPuuidClick && onPuuidClick(summoner);
                }}
              >查看</Button>
            </Flex>
          </ContentCard>
        ))}
    </Grid>
  );
}

export default memo(NiumaSelector);
