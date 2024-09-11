import { memo, useState, useEffect } from 'react';
import {
  summonerStateMap,
  summonerMapChange,
  refreshStates,
} from '../../services/info-share/base-info-share';
import SummonerCard from '../../components/summoner-card.tsx';
import { useSubscribe } from '../../hooks/common';
import { SummonerState } from 'wxx-protobufs/rest.user';

function SummonerList() {
  const [states, setStates] = useState<SummonerState[]>(Array.from(summonerStateMap.values()));

  useSubscribe(summonerMapChange, () => {
    setStates(Array.from(summonerStateMap.values()));
  });

  useEffect(() => {
    refreshStates();
  }, []);

  return states.map(({ info, phase }) =>
    info === undefined ? null : (
      <SummonerCard key={info.base!.summonerId} info={info} phase={phase} />
    ),
  );
}

export default memo(SummonerList);
