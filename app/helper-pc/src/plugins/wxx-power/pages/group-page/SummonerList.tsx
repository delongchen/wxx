import { memo, useEffect, useState } from 'react';
import {
  summonerStateMap,
  SummonerState,
  summonerMapChange,
} from '@/plugins/wxx-power/services/info-share/base-info-share.ts';
import SummonerCard from '@/plugins/wxx-power/components/summoner-card.tsx';

function SummonerList() {
  const [states, setStates] = useState<SummonerState[]>(Array.from(summonerStateMap.values()));

  useEffect(() => {
    const subscription = summonerMapChange.subscribe(() => {
      setStates(Array.from(summonerStateMap.values()));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return states.map(({ info, phase }) => (
    <SummonerCard key={info.summonerId} info={info} phase={phase} />
  ));
}

export default memo(SummonerList);
