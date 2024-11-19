import { HStack, Stack, Text } from '@chakra-ui/react';
import { Avatar } from '@/components/ui/avatar';

interface PlayerPersonaProps {
  profileIcon: number
  gameName: string
  tagLine: string
}

function PlayerPersona(props: PlayerPersonaProps) {
  const { profileIcon, gameName, tagLine } = props;

  return (
    <HStack gap="4" p="2">
      <Avatar
        name={gameName}
        size="lg"
        src={`https://ddragon.leagueoflegends.com/cdn/14.22.1/img/profileicon/${profileIcon}.png`}
      />
      <Stack gap="0">
        <Text fontWeight="medium">{gameName}</Text>
        <Text color="fg.muted" textStyle="sm">
          #{tagLine}
        </Text>
      </Stack>
    </HStack>
  );
}

export default PlayerPersona;