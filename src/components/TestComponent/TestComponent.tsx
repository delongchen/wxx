import React, { useEffect, useState } from "react";
import { GameState } from "../../constant";
import { getSummonersById, getTeamSummonerId } from "../../api";

export const TestComponent: React.FC<{ state?: GameState }> = ({ state }) => {
  const [data, setData] = useState<any[]>([]);
  useEffect(() => {
    if (state === GameState.GameStateChampSelect) {
      getTeamSummonerId().then((res) => {
        getSummonersById(res?.concat(res ?? []) ?? []).then((s) => {
          console.log(s);
        });
        setData(res ?? []);
      });
    }
  }, [state]);
  return <div>{data.join("\n")}</div>;
};
