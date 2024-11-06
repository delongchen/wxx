import { useInfiniteQuery } from '@tanstack/react-query';
import { TeamPlayer } from 'tauri-plugin-wxx-core';
import { getMatchHistory } from 'tauri-plugin-wxx-core/lcu-api/match-history';

export const useMatchHistory = (player: TeamPlayer) => {
  return useInfiniteQuery({
    queryKey: ['match-history', player.summonerId],
    queryFn: async ({ pageParam = 1 }) => {
      const data = await getMatchHistory({
        puuid: player.summonerId,
        begIndex: (pageParam - 1) * 20,
        endIndex: pageParam * 20,
      });
      return {
        data: data.games,
        nextPageParam: pageParam + 1,
      };
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.nextPageParam;
    },
  });
};
