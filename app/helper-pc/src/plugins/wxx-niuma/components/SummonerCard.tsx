import { PropsWithChildren } from 'react';
import type { SummonerInfo } from 'tauri-plugin-wxx-core';
import { Box, Flex, IconButton, Spacer } from '@chakra-ui/react';
import { VscClose, VscRefresh, VscStarFull } from 'react-icons/vsc';
import PlayerPersona from './PlayerPersona.tsx';

type SummonerCardProps = PropsWithChildren<{
  summoner: SummonerInfo;
  main?: boolean;
  bg?: string;
}>

function SummonerCard({ children, summoner, main, bg = 'white' }: SummonerCardProps) {
  const { profileIconId, gameName, tagLine } = summoner
  const isMainCard = main === true

  return (
    <Flex p='2' m='4' bg={bg} borderRadius="12px" pos='relative'>
      {!isMainCard && (
        <Box pos='absolute' right='0' top='0'>
          <IconButton colorPalette='yellow' size='xs' ml='1'>
            <VscStarFull color='yellow' />
          </IconButton>
          <IconButton colorPalette='green' size='xs' ml='1'>
            <VscRefresh />
          </IconButton>
          <IconButton colorPalette='red' size='xs' ml='1'>
            <VscClose />
          </IconButton>
        </Box>
      )}
      <PlayerPersona
        profileIcon={profileIconId}
        gameName={gameName}
        tagLine={tagLine}
        nameBadge={isMainCard ? ['green', 'online']: undefined}
      />
      <Spacer>{children}</Spacer>
    </Flex>
  )
}

export default SummonerCard
