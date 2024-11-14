import { memo, useEffect, useState } from 'react';
import { useCurrentSummoner } from 'tauri-plugin-wxx-core/hooks'
import NiumaSelector from './NiumaSelector.tsx';
import NiumaDashboard from './NiumaDashboard.tsx';


function NiumaPage() {
  const [activatingPuuid, setActivatingPuuid] = useState('')
  const currentSummoner = useCurrentSummoner()

  useEffect(() => {
    if (currentSummoner !== null && activatingPuuid === '') {
      setActivatingPuuid(currentSummoner.puuid)
    }
  }, [activatingPuuid, currentSummoner]);

  return activatingPuuid === "" ? (
    <NiumaSelector onPuuidClick={setActivatingPuuid} />
  ) : (
    <NiumaDashboard puuid={activatingPuuid} />
  )
}

export default memo(NiumaPage);
