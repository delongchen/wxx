/** MHF = Match History Fetching */
import { useCallback, useEffect, useState, useTransition } from 'react';
import { SummonerInfoWithoutReRoll } from 'tauri-plugin-wxx-core';
import {
  listenFetchMatchHistoryTask,
  FetchMatchHistoryStage,
  ScanningIndexData,
} from 'tauri-plugin-wxx-core/events';
import ContentCard from './ContentCard';
import { Text } from '@chakra-ui/react';

interface FetchingState {
  all: number;
  fetched: number;
}

interface FetchingContext {
  puuid: string;
  status: {
    finished: boolean;
    ok: boolean;
  };
  summonerInfo: SummonerInfoWithoutReRoll | null;
  scanningState: ScanningIndexData | null;
  fetchingState: FetchingState | null;
}

const FetchingContextMap: Map<string, FetchingContext> = new Map;
const newTask = (puuid: string) => {
  FetchingContextMap.set(puuid, {
    puuid,
    status: { finished: false, ok: false },
    fetchingState: null,
    summonerInfo: null,
    scanningState: null,
  });
};
const getCtxArray = () => [...FetchingContextMap.values()];
const needPrevCtx = (puuid: string, cb?: (ctx: FetchingContext) => void) => {
  const exist = FetchingContextMap.get(puuid);
  if (exist !== undefined && !exist.status.finished) {
    cb && cb(exist);
    return true;
  }

  return false;
};

function MHFTaskCardContent({ ctx }: { ctx: FetchingContext }) {
  const { summonerInfo, scanningState, fetchingState, status, puuid } = ctx

  if (status.finished) {
    return <Text>task: {puuid} {status.ok ? 'ok': 'fail'}</Text>
  }

  if (fetchingState !== null) {
    const { all, fetched } = fetchingState;
    return (
      <Text>all: {all} fetched: {fetched}</Text>
    )
  }

  if (scanningState !== null) {
    const { begIndex, endIndex } = scanningState;
    return (
      <Text>scanning match history: {begIndex} - {endIndex}</Text>
    )
  }

  if (summonerInfo !== null) {
    return (
      <Text>summoner: {summonerInfo.gameName}#{summonerInfo.tagLine}</Text>
    )
  }

  return (
    <Text>fetching summoner info: {puuid}</Text>
  );
}

function MHFTaskList() {
  const [ctxArray, setCtxArray] = useState<FetchingContext[]>([]);
  const [, startTransition] = useTransition()

  const reRender = useCallback(() => {
    startTransition(() => {
      setCtxArray(getCtxArray());
    })
  }, []);

  useEffect(() => {
    reRender();

    const listener = listenFetchMatchHistoryTask(({ payload }) => {
      const { stage, puuid } = payload;

      if (stage === FetchMatchHistoryStage.StartTask) {
        if (!needPrevCtx(puuid)) {
          newTask(puuid);
          reRender();
        }
      } else if (stage === FetchMatchHistoryStage.FetchedSummoner) {
        needPrevCtx(puuid, ctx => {
          ctx.summonerInfo = payload.data;
          reRender();
        });
      } else if (stage === FetchMatchHistoryStage.ScanningIndex) {
        needPrevCtx(puuid, ctx => {
          ctx.scanningState = payload.data;
          reRender();
        });
      } else if (stage === FetchMatchHistoryStage.FetchingMatchDetail) {
        needPrevCtx(puuid, ctx => {
          ctx.fetchingState = {
            all: payload.data.indexCount,
            fetched: 0,
          };
          reRender();
        });
      } else if (stage === FetchMatchHistoryStage.FetchedMatchDetail) {
        needPrevCtx(puuid, ctx => {
          if (ctx.fetchingState !== null) {
            ctx.fetchingState.fetched += payload.data.fetched;
            reRender();
          }
        });
      } else if (stage === FetchMatchHistoryStage.EndTask) {
        needPrevCtx(puuid, ctx => {
          ctx.status.finished = true;
          ctx.status.ok = payload.data.ok;
          reRender();
        });
      }
    });

    return () => {
      listener.then(stop => stop());
    };
  }, []);

  return ctxArray.map(ctx => (
    <ContentCard key={ctx.puuid}>
      <MHFTaskCardContent ctx={ctx} />
    </ContentCard>
  ));
}

export default MHFTaskList;