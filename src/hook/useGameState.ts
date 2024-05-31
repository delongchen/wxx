import { useEffect, useState } from "react";
import { registerListenLcuEvent } from "../utils";
import { SubcriptionType, GameState } from "../constant";
import { useToast } from "@chakra-ui/react";

export const useGameState = () => {
  const toast = useToast();
  const [state, setState] = useState<GameState>(GameState.GameStateNone);

  useEffect(() => {
    toast({
      title: "Game State",
      description: `LOL client state change to ${state}`,
      status: "info",
      duration: 3000,
    });
  }, [state]);

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
  }, [toast]);

  return [state];
};
