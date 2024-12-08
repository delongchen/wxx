import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';
import { ChangeEvent, memo, useCallback, useEffect, useState } from 'react';
import type { SummonerInfo } from 'tauri-plugin-wxx-core';
import { getSummonerByName } from 'tauri-plugin-wxx-core/lcu-api/summoner';
import { useNiumaContext } from '@/plugins/wxx-niuma/context/hooks';
import { Field } from '@/components/ui/field.tsx';
import CenterBox from '@/plugins/wxx-niuma/components/CenterBox.tsx';
import { SummonerStore } from '../core/niuma-task-manager';
import GameSyncTaskCard from '../components/GameSyncTask.tsx';


const checkTagLine = (tagLine: string): boolean => {
  return tagLine.length === 5 && ![...tagLine].map(n => +n).some(window.isNaN);
};

const LcuUnusable = (
  <CenterBox>
    <Flex
      flexDirection="column"
      alignItems="center"
    >
      <Text textStyle="2xl">连接不上游戏捏</Text>
      <Text textStyle="sm">可能是没启动游戏</Text>
      <Text textStyle="sm">或者是没有以管理员身份运行</Text>
    </Flex>
  </CenterBox>
);

function SummonerFinder(props: { onNameSubmit: (name: string) => void }) {
  const { theme } = useNiumaContext();

  const [summonerName, setSummonerName] = useState<string>('');
  const [tagLine, setTagLine] = useState<string>('');

  const handleNameInput = useCallback((ev: ChangeEvent) => {
    setSummonerName(Reflect.get(ev.target, 'value') as string);
  }, []);

  const handleTagInput = useCallback((ev: ChangeEvent) => {
    setTagLine(Reflect.get(ev.target, 'value') as string);
  }, []);

  const handleCheckClick = () => {
    props.onNameSubmit(encodeURIComponent(`${summonerName}#${tagLine}`));
    setSummonerName('');
    setTagLine('');
  };

  return (
    <Flex p="2" gap="2" alignItems="center" justifyContent="center">
      <Field
        required
        label="Name"
        errorText="summoner name cannot be empty!"
        invalid={summonerName === ''}
      >
        <Input onChange={handleNameInput} value={summonerName} />
      </Field>

      <Field
        required
        label="Tag"
        errorText="tag must be five numbers!"
        invalid={!checkTagLine(tagLine)}
      >
        <Input onChange={handleTagInput} value={tagLine} />
      </Field>

      <Button
        onClick={handleCheckClick}
        colorPalette={theme}
        disabled={!checkTagLine(tagLine)}
      >check</Button>
    </Flex>
  );
}

function HistoryFetchPage() {
  const { currentSummoner } = useNiumaContext();
  const [summoners, setSummoners] = useState<SummonerInfo[]>([]);

  useEffect(() => {
    SummonerStore.syncToLocal();
    setSummoners(SummonerStore.readAsArray());
  }, []);

  useEffect(() => {
    if (currentSummoner !== null) {
      SummonerStore.fetchAndCache(async () => currentSummoner);
    }
  }, [currentSummoner]);

  const handleFinderSubmit = useCallback(async (name: string) => {
    await SummonerStore.fetchAndCache(() => getSummonerByName({ name }));
    setSummoners(SummonerStore.readAsArray());
  }, []);

  if (currentSummoner === null) return LcuUnusable;

  return (
    <Box p="2">
      <GameSyncTaskCard summoner={currentSummoner} main={true} />
      <SummonerFinder onNameSubmit={handleFinderSubmit} />
      {summoners
        .filter(summoner => summoner.puuid !== currentSummoner.puuid)
        .map(summoner => (
          <GameSyncTaskCard key={summoner.puuid} summoner={summoner} />
        ))
      }
    </Box>
  );
}

export default memo(HistoryFetchPage);
