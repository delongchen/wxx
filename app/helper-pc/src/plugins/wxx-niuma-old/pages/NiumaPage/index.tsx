import { memo, useState, Suspense } from 'react';
import type { SummonerInfoWithoutReRoll } from 'tauri-plugin-wxx-core';
import { useNiumaWorker } from '../../workers'
import type { NiumaChartDataType } from '../../workers/types'
import { getGamesByPuuid } from 'tauri-plugin-wxx-core/api'
import NiumaSelector from './NiumaSelector.tsx';
import NiumaDashboard from './NiumaDashboard.tsx';


function NiumaPage() {
  const [activatingSummoner, setActivatingSummoner] = useState<SummonerInfoWithoutReRoll | null>(null);
  const { invoke } = useNiumaWorker()

  if (activatingSummoner === null) {
    return (
      <NiumaSelector
        onPuuidClick={setActivatingSummoner}
      />
    )
  }

  const { puuid } = activatingSummoner

  const chartDataPromise = getGamesByPuuid(puuid)
    .then(buf => invoke<NiumaChartDataType>('analyze', { puuid, matchesBuffer: buf }))

  return (
    <Suspense fallback={null}>
      <NiumaDashboard
        summoner={activatingSummoner}
        chartDataPromise={chartDataPromise}
      />
    </Suspense>
  );
}

export default memo(NiumaPage);
