export enum GameState {
  GameStateNone = "None",
  GameStateLobby = "Lobby",
  GameStateStart = "GameStart",
  GameStateChampSelect = "ChampSelect",
  GameStateReadyCheck = "ReadyCheck",
  GameStateInGame = "InGame",
  GameStateOther = "Other",
  GameStateMatchmaking = "Matchmaking",
}

export enum GameType {
  NormalQueueID = 430, // 匹配
  RankSoleQueueID = 420, // 单排
  RankFlexQueueID = 440, // 组排
  ARAMQueueID = 450, // 大乱斗
  URFQueueID = 900, // 无限火力
  BOTSimpleQueueID = 830, // 人机入门
  BOTNoviceQueueID = 840, // 人机新手
  BOTNormalQueueID = 850, // 人机一般
}

export const GameNameMap = {
  [GameType.NormalQueueID]: "匹配",
  [GameType.RankSoleQueueID]: "单双",
  [GameType.RankFlexQueueID]: "组排",
  [GameType.ARAMQueueID]: "大乱斗",
  [GameType.URFQueueID]: "URF",
  [GameType.BOTSimpleQueueID]: "人机",
  [GameType.BOTNoviceQueueID]: "人机",
  [GameType.BOTNormalQueueID]: "人机",
};
