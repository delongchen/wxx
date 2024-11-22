import { Box, Button, Input, Flex, Text } from '@chakra-ui/react';
import { createMatchHistoryFetchingTask } from 'tauri-plugin-wxx-core/api';
import type { SummonerInfo } from 'tauri-plugin-wxx-core';
import { getSummonerByName } from 'tauri-plugin-wxx-core/lcu-api/summoner';
import { useCallback, useState, ChangeEvent } from 'react';
import MHFTaskList from '../components/MHFTaskList.tsx';
import { useNiumaContext } from '@/plugins/wxx-niuma/context/hooks';
import { Tooltip } from '@/components/ui/tooltip.tsx';
import { Field } from '@/components/ui/field.tsx';
import ContentCard from '@/plugins/wxx-niuma/components/ContentCard.tsx';
import CenterBox from '@/plugins/wxx-niuma/components/CenterBox.tsx';


const checkTagLine = (tagLine: string): boolean => {
  if (tagLine.length !== 5) return false;

  return ![...tagLine]
    .map(n => +n)
    .some(isNaN);
};

function HistoryFetchPage() {
  const { theme, currentSummoner } = useNiumaContext();
  const [checkedSummoner, setCheckedSummoner] = useState<SummonerInfo | null>(null);
  const [summonerName, setSummonerName] = useState<string>('');
  const [tagLine, setTagLine] = useState<string>('');

  const handleClick = useCallback((puuid: string) => {
    createMatchHistoryFetchingTask(puuid, console.error);
  }, []);

  const handleNameInput = useCallback((ev: ChangeEvent) => {
    setSummonerName(Reflect.get(ev.target, 'value') as string);
  }, []);

  const handleTagInput = useCallback((ev: ChangeEvent) => {
    setTagLine(Reflect.get(ev.target, 'value') as string);
  }, []);

  const checkSummoner = (name: string, tag: string) => {
    getSummonerByName({ name: encodeURIComponent(`${name}#${tag}`) })
      .then(setCheckedSummoner)
      .catch(() => {
        setCheckedSummoner(null);
      });
  };

  if (currentSummoner === null) {
    return (
      <CenterBox>
        <Flex
          flexDirection="column"
          alignItems="center"
        >
          <Text textStyle='2xl'>连接不上游戏捏</Text>
          <Text textStyle='sm'>可能是没启动游戏</Text>
          <Text textStyle='sm'>或者是没有以管理员身份运行</Text>
        </Flex>
      </CenterBox>
    )
  }

  return (
    <Box p="2">
      <Flex p="2" gap="2" alignItems="center" justifyContent="center">
        <Field
          required
          label="Name"
          errorText="summoner name cannot be empty!"
          invalid={summonerName === ''}
        >
          <Input onChange={handleNameInput} />
        </Field>

        <Field
          required
          label="Tag"
          errorText="tag must be five numbers!"
          invalid={!checkTagLine(tagLine)}
        >
          <Input
            onChange={handleTagInput}
          />
        </Field>

        <Button
          onClick={() => {
            checkSummoner(summonerName, tagLine);
          }}
          colorPalette={theme}
          disabled={!checkTagLine(tagLine)}
        >check</Button>

        <Tooltip
          content="check name first!"
          disabled={checkedSummoner !== null}
          openDelay={100}
          closeDelay={100}
        >
          <Button
            colorPalette={theme}
            disabled={checkedSummoner === null}
            onClick={() => {
              handleClick(checkedSummoner!.puuid)
            }}
          >fetch</Button>
        </Tooltip>
      </Flex>

      {checkedSummoner !== null && (
        <ContentCard>
          <p>{checkedSummoner.gameName}#{checkedSummoner.tagLine}</p>
        </ContentCard>
      )}

      <MHFTaskList />
    </Box>
  );
}

export default HistoryFetchPage;
