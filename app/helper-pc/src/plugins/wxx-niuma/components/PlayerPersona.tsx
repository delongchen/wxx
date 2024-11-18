import type { Player } from 'tauri-plugin-wxx-core';
import { HStack, Stack, Text } from '@chakra-ui/react';
import { Avatar } from '@/components/ui/avatar';

interface PlayerPersonaProps {
  player?: Player;
}

function PlayerPersona(props: PlayerPersonaProps) {
  const { player } = props;

  if (player === undefined) return null;

  return (
    <HStack gap="4" p="2">
      <Avatar name={player.gameName} size="lg" />
      <Stack gap="0">
        <Text fontWeight="medium">{player.gameName}</Text>
        <Text color="fg.muted" textStyle="sm">
          #{player.tagLine}
        </Text>
      </Stack>
    </HStack>
  );
}

export default PlayerPersona;