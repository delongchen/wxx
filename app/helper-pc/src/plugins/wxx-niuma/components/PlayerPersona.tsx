import { HStack, Stack, Text, Flex, Badge } from '@chakra-ui/react';
import { Avatar } from '@/components/ui/avatar';
import { useNiumaContext } from '../context/hooks'

interface PlayerPersonaProps {
  profileIcon: number;
  gameName: string;
  tagLine: string;
  nameBadge?: [string, string];
}

function PlayerPersona(props: PlayerPersonaProps) {
  const { profileIcon, gameName, tagLine, nameBadge } = props;
  const { latestVersion } = useNiumaContext();

  const avatarPNGSrc = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/profileicon/${profileIcon}.png`

  return (
    <HStack gap="4" p="2">
      <Avatar
        name={gameName}
        size="lg"
        src={avatarPNGSrc}
      />
      <Stack gap="0">
        <Flex>
          <Text fontWeight="medium">{gameName}</Text>
          {nameBadge && (
            <Badge ml="1" variant="solid" colorPalette={nameBadge[0]}>
              {nameBadge[1]}
            </Badge>
          )}
        </Flex>
        <Text color="fg.muted" textStyle="sm">
          #{tagLine}
        </Text>
      </Stack>
    </HStack>
  );
}

export default PlayerPersona;