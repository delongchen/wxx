import { memo, useState } from 'react';
import {
  summonerStateMap,
  SummonerState,
  summonerMapChange,
} from '../../services/info-share/base-info-share';
import SummonerCard from '../../components/summoner-card.tsx';
import { useSubscribe } from '../../hooks/common'

function SummonerList() {
  const [states, setStates] = useState<SummonerState[]>(Array.from(summonerStateMap.values()));

  useSubscribe(summonerMapChange, () => {
    setStates(Array.from(summonerStateMap.values()));
  })

  return states.map(({ info, phase }) => (
    <SummonerCard
      key={info.base!.summonerId}
      info={info}
      phase={phase}
    />
  ));
}

export default memo(SummonerList);
