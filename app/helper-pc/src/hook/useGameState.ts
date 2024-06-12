import { useToast } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { GameState, SubcriptionType } from '../constant';
import { LcuClient } from '../utils';

export const useGameState = () => {
  const toast = useToast();
  const [state, setState] = useState<GameState>(GameState.GameStateNone);

  useEffect(() => {
    toast({
      title: 'Game State',
      description: `LOL client state change to ${state}`,
      status: 'info',
      duration: 3000,
    });
  }, [state]);

  useEffect(() => {
    const unregister = LcuClient.listen((event) => {
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
