import { memo, useState } from 'react';
import type { SummonerInfoWithoutReRoll } from 'tauri-plugin-wxx-core';
import NiumaSelector from './NiumaSelector.tsx';
import NiumaDashboard from './NiumaDashboard.tsx';


function NiumaPage() {
  const [activatingSummoner, setActivatingSummoner] = useState<SummonerInfoWithoutReRoll | null>(null);

  return activatingSummoner === null ? (
    <NiumaSelector onPuuidClick={setActivatingSummoner} />
  ) : (
    <NiumaDashboard summoner={activatingSummoner} />
  );
}

export default memo(NiumaPage);
