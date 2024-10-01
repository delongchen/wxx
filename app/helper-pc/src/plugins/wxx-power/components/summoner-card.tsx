import { memo, useCallback, useState } from 'react';
import {
  Card,
  CardHeader,
  CardBody,
  Flex,
  Avatar,
  AvatarBadge,
  Box,
  Text,
  Spacer,
  Heading,
  Tag,
  IconButton,
  Progress,
} from '@chakra-ui/react';
import { VscMenu } from 'react-icons/vsc';
import { GameflowPhaseEnum } from 'wxx-protobufs/lcu.gameflow';
import { SummonerState } from 'wxx-protobufs/rest.user';
import { useAppTheme } from "@/app/context/app-context.tsx";

interface PhaseInfo {
  text: string;
  color: 'gray' | 'green' | 'red' | 'yellow';
}

type PhaseEnumRecord<T> = { [key in GameflowPhaseEnum]: T };

const phaseInfoMap: PhaseEnumRecord<PhaseInfo> = Object.freeze({
  [GameflowPhaseEnum.Matchmaking]: {
    text: '正在匹配',
    color: 'yellow',
  },
  [GameflowPhaseEnum.ChampSelect]: {
    text: '正在选择混子',
    color: 'red',
  },
  [GameflowPhaseEnum.ReadyCheck]: {
    text: '没点接受',
    color: 'yellow',
  },
  [GameflowPhaseEnum.InProgress]: {
    text: '正在战斗',
    color: 'red',
  },
  [GameflowPhaseEnum.EndOfGame]: {
    text: '赛后指点中',
    color: 'red',
  },
  [GameflowPhaseEnum.Lobby]: {
    text: '等鸽子',
    color: 'yellow',
  },
  [GameflowPhaseEnum.GameStart]: {
    text: '马上开始战斗',
    color: 'red',
  },
  [GameflowPhaseEnum.None]: {
    text: '挂机中',
    color: 'green',
  },
  [GameflowPhaseEnum.Reconnect]: {
    text: '掉线惹',
    color: 'gray',
  },
  [GameflowPhaseEnum.WaitingForStats]: {
    text: '等待结算',
    color: 'yellow',
  },
  [GameflowPhaseEnum.PreEndOfGame]: {
    text: '正在赛后投票',
    color: 'yellow',
  },
  [GameflowPhaseEnum.WatchInProgress]: {
    text: '正在视奸别人',
    color: 'green',
  },
  [GameflowPhaseEnum.UNRECOGNIZED]: {
    text: '离线',
    color: 'gray',
  },
});

function SummonerCard({ info, phase }: SummonerState) {
  const theme = useAppTheme()
  const [showBody, setShowBody] = useState(false);

  const handleClick = useCallback(() => {
    setShowBody(!showBody);
  }, [showBody]);

  if (info === undefined) return null;

  const phaseInfo = phaseInfoMap[phase];

  return (
    <Card colorScheme={theme}>
      <CardHeader>
        <Flex>
          <Flex flex="1" gap="4" alignItems="center">
            <Avatar
              name={info.base?.gameName}
              src={`http://localhost:11460/profile-icon/${info.base?.profileIconId}`}
            >
              <AvatarBadge boxSize="1em" bg={`${phaseInfo.color}.500`} />
            </Avatar>

            <Box>
              <Heading size="sm">
                {info.base?.gameName}
                <Tag>#{info.base?.tagLine}</Tag>
              </Heading>
              <Text>{phaseInfo.text}</Text>
            </Box>

            <Flex direction="column" alignItems="center">
              <Text>
                roll点: {info.rerollPoints!.numberOfRolls}/{info.rerollPoints!.maxRolls}
              </Text>
              <Progress
                width="96px"
                value={((info.rerollPoints!.currentPoints % 250) * 100) / 250}
                colorScheme={theme}
              />
            </Flex>
          </Flex>

          <Spacer />

          <IconButton
            aria-label="more"
            variant="ghost"
            colorScheme={theme}
            icon={<VscMenu size="24px" />}
            onClick={handleClick}
          />
        </Flex>
      </CardHeader>

      {showBody && <CardBody>没啥了 等下次更新8</CardBody>}
    </Card>
  );
}

export default memo(SummonerCard);
