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
import { GameflowPhaseEnum } from 'wxx-protobufs/lcu';
import { SummonerState } from '../services/info-collect/collect-summoner';
import { useAppSelector } from '@/store';
import { selectGlobal } from '@/store/modules/global';

interface PhaseInfo {
  text: string;
  color: 'gray' | 'green' | 'red' | 'yellow';
}

type PhaseEnumRecord<T> = { [key in GameflowPhaseEnum]: T };

const phaseInfoMap: PhaseEnumRecord<PhaseInfo> = {
  [GameflowPhaseEnum.Matchmaking]: {
    text: '正在匹配',
    color: 'yellow',
  },
  [GameflowPhaseEnum.ChampSelect]: {
    text: '正在选择混子',
    color: 'red',
  },
  [GameflowPhaseEnum.ReadyCheck]: {
    text: '正在纠结接受还是拒绝',
    color: 'yellow',
  },
  [GameflowPhaseEnum.InProgress]: {
    text: '正在战斗',
    color: 'red',
  },
  [GameflowPhaseEnum.EndOfGame]: {
    text: '正在赛后指指点点',
    color: 'red',
  },
  [GameflowPhaseEnum.Lobby]: {
    text: '可能在等哪个鸽子',
    color: 'yellow',
  },
  [GameflowPhaseEnum.GameStart]: {
    text: '马上开始战斗',
    color: 'red',
  },
  [GameflowPhaseEnum.None]: {
    text: '搁外头不知道在干啥',
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
    text: '正在思考给谁投票',
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
};

function SummonerCard({ info, phase }: SummonerState) {
  const { theme } = useAppSelector(selectGlobal);
  const [showBody, setShowBody] = useState(false);

  const handleClick = useCallback(() => {
    setShowBody(!showBody);
  }, [showBody]);

  const phaseInfo = phaseInfoMap[phase];

  return (
    <Card colorScheme={theme}>
      <CardHeader>
        <Flex>
          <Flex flex="1" gap="4" alignItems="center">
            <Avatar
              name={info.gameName}
              src={`http://localhost:11460/profile-icon/${info.profileIconId}`}
            >
              <AvatarBadge boxSize="1em" bg={`${phaseInfo.color}.500`} />
            </Avatar>

            <Box>
              <Heading size="sm">
                {info.gameName}
                <Tag>#{info.tagLine}</Tag>
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
