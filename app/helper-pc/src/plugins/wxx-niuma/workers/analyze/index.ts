import type {
  MatchReport,
  NiumaAnalyzeContext,
  NiumaAnalyzeProps, NiumaChartDataType,
} from '../types';
import { parseMatchesBuffer } from '../parse';
import { MatchAnalyzeHelper } from './analyze-helper.ts';

export const analyzeMatches = (props: NiumaAnalyzeProps): NiumaChartDataType => {
  const { puuid, matchesBuffer } = props;
  const rawGames = parseMatchesBuffer(matchesBuffer);
  const games = rawGames.map(it => new MatchAnalyzeHelper(it));
  const reports = games
    .map(game => game.genMatchReport(puuid))
    .filter(report => report !== null) as MatchReport[];

  const ctx: NiumaAnalyzeContext = {
    reports,
    mainPuuid: puuid,
    result: {
      dataVecMap: {},
      creationVec: [],
    },
  };

  return ctx.result;
};
