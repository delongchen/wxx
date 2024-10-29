/** MHF = Match History Fetching */
import { useCallback, useEffect, useState } from 'react';
import { SummonerInfoWithoutReRoll } from 'tauri-plugin-wxx-core';
import {
  listenFetchMatchHistoryTask,
  FetchMatchHistoryStage,
  ScanningIndexData,
} from 'tauri-plugin-wxx-core/events';

interface FetchingState {
  all: number
  fetched: number
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
    scanningState: null
  })
}
const getCtxArray = () => [...FetchingContextMap.values()];
const needPrevCtx = (puuid: string, cb?: (ctx: FetchingContext) => void) => {
  const exist = FetchingContextMap.get(puuid);
  if (exist !== undefined && !exist.status.finished) {
    cb && cb(exist);
    return true
  }

  return false;
}

function MHFTaskCardContent({ ctx }: { ctx: FetchingContext }) {
  return (
    <div>
      <pre>{JSON.stringify(ctx)}</pre>
    </div>
  );
}

function MHFTaskList() {
  const [ctxArray, setCtxArray] = useState<FetchingContext[]>([]);

  const reRender = useCallback(() => {
    setCtxArray(getCtxArray());
  }, [])

  useEffect(() => {
    reRender()

    const listener = listenFetchMatchHistoryTask(({ payload }) => {
      const { stage, puuid } = payload;

      if (stage === FetchMatchHistoryStage.StartTask) {
        if (!needPrevCtx(puuid)) {
          newTask(puuid);
          reRender();
        }
      } else if (stage === FetchMatchHistoryStage.FetchedSummoner) {
        needPrevCtx(puuid, ctx => {
          ctx.summonerInfo = payload.data
          reRender()
        })
      } else if (stage === FetchMatchHistoryStage.ScanningIndex) {
        needPrevCtx(puuid, ctx => {
          ctx.scanningState = payload.data
          reRender()
        })
      } else if (stage === FetchMatchHistoryStage.FetchingMatchDetail) {
        needPrevCtx(puuid, ctx => {
          ctx.fetchingState = {
            all: payload.data.indexCount,
            fetched: 0,
          }
          reRender()
        })
      } else if (stage === FetchMatchHistoryStage.FetchedMatchDetail) {
        needPrevCtx(puuid, ctx => {
          if (ctx.fetchingState !== null) {
            ctx.fetchingState.fetched += payload.data.fetched
            reRender()
          }
        })
      } else if (stage === FetchMatchHistoryStage.EndTask) {
        needPrevCtx(puuid, ctx => {
          ctx.status.finished = true;
          ctx.status.ok = payload.data.ok;
          reRender()
        })
      }
    });

    return () => {
      listener.then(stop => stop());
    };
  }, []);

  return ctxArray.map(ctx => (
    <MHFTaskCardContent key={ctx.puuid} ctx={ctx} />
  ));
}

export default MHFTaskList;