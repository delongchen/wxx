import { PropsWithChildren } from 'react';
import type { SummonerInfo } from 'tauri-plugin-wxx-core';
import { Flex, Spacer } from '@chakra-ui/react';
import PlayerPersona from './PlayerPersona.tsx';

type SummonerCardProps = PropsWithChildren<{
  summoner: SummonerInfo;
  main?: boolean;
  bg?: string;
}>

function SummonerCard({ children, summoner, main, bg = 'white' }: SummonerCardProps) {
  const { profileIconId, gameName, tagLine } = summoner;
  const isMainCard = main === true;

  return (
    <Flex p="2" m="4" bg={bg} borderRadius="12px" pos="relative">
      <PlayerPersona
        profileIcon={profileIconId}
        gameName={gameName}
        tagLine={tagLine}
        nameBadge={isMainCard ? ['green', '当前登录'] : undefined}
      />
      <Spacer>{children}</Spacer>
    </Flex>
  );
}

export default SummonerCard;
