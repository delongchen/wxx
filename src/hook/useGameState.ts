import { useEffect, useState } from "react";
import { registerListenLcuEvent } from "../utils";
import { SubcriptionType, GameState } from "../constant";

export const useGameState = () => {
  const [state, setState] = useState<GameState>();

  useEffect(() => {
    const unregister = registerListenLcuEvent((event) => {
      if (!event) {
        return;
      }
      switch (event.payload.subscription_type) {
        case SubcriptionType.GameFlow:
          setState(event.payload.data as GameState);
          break;

        default:
          break;
      }
    });
    return () => {
      unregister.then((r) => r());
    };
  }, []);

  return [state];
};
