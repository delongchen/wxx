import { useEffect, useState } from 'react';
import { gameFlowPhaseStream } from '../lcu';
import { GameflowPhaseEnum } from 'wxx-protobufs/lcu.gameflow';
import { getGameflowSession } from 'tauri-plugin-wxx-core/lcu-api/gameflow';
import { TeamPlayer } from 'tauri-plugin-wxx-core';

export const useSummoners = () => {
  const [teammates, setTeammates] = useState<TeamPlayer[]>([]);
  const [enemies, setEnemies] = useState<TeamPlayer[]>([]);
  useEffect(() => {
    gameFlowPhaseStream.subscribe(phase => {
      switch (GameflowPhaseEnum[phase]) {
        case GameflowPhaseEnum.ChampSelect:
          // fetch teammates
          getGameflowSession().then(session => {
            setTeammates(session.gameData.teamOne);
          });
          break;
        case GameflowPhaseEnum.InProgress:
          // fetch enemies
          getGameflowSession().then(session => {
            setEnemies(session.gameData.teamTwo);
          });
          break;
        case GameflowPhaseEnum.EndOfGame:
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
