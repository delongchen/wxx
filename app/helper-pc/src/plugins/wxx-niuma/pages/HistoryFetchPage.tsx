import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';
import { ChangeEvent, memo, useCallback, useEffect, useState } from 'react';
import type { SummonerInfo } from 'tauri-plugin-wxx-core';
import { getSummoners } from 'tauri-plugin-wxx-core/api'
import { useNiumaContext } from '@/plugins/wxx-niuma/context/hooks';
import { Field } from '@/components/ui/field.tsx';
import CenterBox from '@/plugins/wxx-niuma/components/CenterBox.tsx';
import GameSyncTaskCard from '../components/GameSyncTask.tsx';


interface SummonerFinderProps {
  onNameSubmit: (name: string, tagLine: string) => void
}

const checkTagLine = (tagLine: string) => (
  tagLine.length === 5 &&
  ![...tagLine].map(n => +n).some(window.isNaN)
)

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

const useElementValueCallback = (cb: (value: string) => void) => {
  return useCallback((ev: ChangeEvent) => {
    cb(Reflect.get(ev.target, 'value') as string);
  }, [])
}

function SummonerFinder({ onNameSubmit }: SummonerFinderProps) {
  const { theme } = useNiumaContext();

  const [summonerName, setSummonerName] = useState<string>('');
  const [tagLine, setTagLine] = useState<string>('');

  const handleNameInput = useElementValueCallback(setSummonerName)
  const handleTagInput = useElementValueCallback(setTagLine)
  const reset = useCallback(() => {
    setSummonerName('');
    setTagLine('');
  }, [])

  const handleCheckClick = () => {
    // encodeURIComponent(`${summonerName}#${tagLine}`)
    onNameSubmit(summonerName, tagLine);
    reset();
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

const renderTaskCard = (summoner: SummonerInfo) => {
  return (
    <GameSyncTaskCard key={summoner.puuid} summoner={summoner} />
  )
}

function HistoryFetchPage() {
  const { currentSummoner } = useNiumaContext();
  const [summoners, setSummoners] = useState<SummonerInfo[]>([]);

  const refresh = useCallback(() => {
    getSummoners(false)
      .then(result => {
        setSummoners(result.map(it => it.summoner as SummonerInfo))
      })
  }, [])

  useEffect(refresh, []);

  const handleFinderSubmit = useCallback(async (name: string, tagLine: string) => {
    console.log(name, tagLine);
  }, []);

  if (currentSummoner === null) return LcuUnusable;

  return (
    <Box p="2">
      <GameSyncTaskCard summoner={currentSummoner} main={true} />
      <SummonerFinder onNameSubmit={handleFinderSubmit} />
      {summoners.length > 0 ? (
        summoners
          .filter(it => it.puuid !== currentSummoner.puuid)
          .map(renderTaskCard)
      ) : (
        <>
          <p>nothing to show</p>
        </>
      )}
    </Box>
  );
}

export default memo(HistoryFetchPage);
