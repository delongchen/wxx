import { createListenFn } from './utils';

export enum FetchMatchHistoryStage {
  StartTask = 'StartTask',
  ScanningIndex = 'ScanningIndex',
  ScannedIndex = 'ScannedIndex',
  FetchingMatchDetail = 'FetchingMatchDetail',
  FetchedMatchDetail = 'FetchedMatchDetail',
  EndTask = 'EndTask',
}

interface StartTaskData {}
interface ScanningIndexData { begIndex: number, endIndex: number }
interface ScannedIndexData { indexCount: number }
interface FetchingMatchDetailData { indexCount: number }
interface FetchedMatchDetailData { fetched: number }
interface EndTaskData { ok: boolean }

interface StartTaskEvent {
  stage: FetchMatchHistoryStage.StartTask;
  data: StartTaskData;
  puuid: string;
}

interface ScanningIndexEvent {
  stage: FetchMatchHistoryStage.ScanningIndex;
  data: ScanningIndexData;
  puuid: string;
}

interface ScannedIndexEvent {
  stage: FetchMatchHistoryStage.ScannedIndex;
  data: ScannedIndexData;
  puuid: string;
}

interface FetchingMatchDetailEvent {
  stage: FetchMatchHistoryStage.FetchingMatchDetail;
  data: FetchingMatchDetailData;
  puuid: string;
}

interface FetchedMatchDetailEvent {
  stage: FetchMatchHistoryStage.FetchedMatchDetail;
  data: FetchedMatchDetailData;
  puuid: string;
}

interface EndTaskEvent {
  stage: FetchMatchHistoryStage.EndTask;
  data: EndTaskData;
  puuid: string;
}

export type FetchMatchHistoryEvent =
  | StartTaskEvent
  | ScanningIndexEvent
  | ScannedIndexEvent
  | FetchingMatchDetailEvent
  | FetchedMatchDetailEvent
  | EndTaskEvent;

export const listenFetchMatchHistoryTask = createListenFn<FetchMatchHistoryEvent>(
  'LCU_MATCH_HISTORY_TASK'
);