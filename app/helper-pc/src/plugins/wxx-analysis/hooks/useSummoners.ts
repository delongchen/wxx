import { useEffect, useState } from 'react';
import { gameFlowPhaseStream } from '../lcu';

// This is just a comment, you can delete it after reading it
//
// wxx-protobufs is designed to share info for other user
// and is best not to be used within other plugin
// import { GameflowPhaseEnum } from 'wxx-protobufs/lcu.gameflow';
//
// You can import it using
// import { GameflowPhase } from 'tauri-plugin-wxx-core'

import { getGameflowSession } from 'tauri-plugin-wxx-core/lcu-api/gameflow';
import { TeamPlayer } from 'tauri-plugin-wxx-core';

export const useSummoners = () => {
  const [teammates, setTeammates] = useState<TeamPlayer[]>([]);
  const [enemies, setEnemies] = useState<TeamPlayer[]>([]);

  /**
   * This is just a comment, you can delete it after reading it
   *
   * When using subscribe, a subscription will be returned
   * You may need to unsubscribe after `useEffect`
   * Here is an example tool
   *
   * const useSubscribe = <T>(source: Observable<T>, ob: (data: T) => void) => {
   *   useEffect(() => {
   *     const subscription = source.subscribe(ob);
   *
   *     return () => {
   *       subscription.unsubscribe();
   *     };
   *   }, []);
   * };
   *
   * example:
   *
   * useSubscribe(gameFlowPhaseStream, phase => {
   *   ...
   * })
   */
  useEffect(() => {
    gameFlowPhaseStream.subscribe(phase => {
      switch (phase) {
        case 'ChampSelect': // GameflowPhaseEnum.ChampSelect:
          // fetch teammates
          getGameflowSession().then(session => {
            setTeammates(session.gameData.teamOne);
          });
          break;
        case 'InProgress': // GameflowPhaseEnum.InProgress:
          // fetch enemies
          getGameflowSession().then(session => {
            setEnemies(session.gameData.teamTwo);
          });
          break;
        case 'EndOfGame': // GameflowPhaseEnum.EndOfGame:
          setTeammates([]);
          setEnemies([]);
          break;
      }
    });
  }, []);
  return {
    teammates,
    enemies,
  };
};
