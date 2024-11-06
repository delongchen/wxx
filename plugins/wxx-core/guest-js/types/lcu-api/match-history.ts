export interface MatchHistory {
  accountId: number
  games: Games
  platformId: string
}

export interface Games {
  gameBeginDate: string
  gameCount: number
  gameEndDate: string
  gameIndexBegin: number
  gameIndexEnd: number
  games: Game[]
}

export interface Game {
  gameCreation: number
  gameCreationDate: string
  gameDuration: number
  gameId: number
  gameMode: string
  gameType: string
  gameVersion: string
  mapId: number
  participantIdentities: ParticipantIdentity[]
  participants: Participant[]
  platformId: string
  queueId: number
  seasonId: number
  teams: Team[]
}

export interface Team {
  bans: any[]
  baronKills: number
  dominionVictoryScore: number
  dragonKills: number
  firstBaron: boolean
  firstBlood: boolean
  firstDargon: boolean // LCU 接口中就是如此拼写，不知道是不是笔误
  firstInhibitor: boolean
  firstTower: boolean
  inhibitorKills: number
  riftHeraldKills: number
  teamId: number
  towerKills: number
  vilemawKills: number
  win: string | 'Win' | 'Fail'
}

export interface Participant {
  championId: number
  highestAchievedSeasonTier: string
  participantId: number
  spell1Id: number
  spell2Id: number
  stats: Stats
  teamId: number
  timeline: Timeline
}

export interface Timeline {
  creepsPerMinDeltas: CreepsPerMinDeltas
  csDiffPerMinDeltas: CsDiffPerMinDeltas
  damageTakenDiffPerMinDeltas: CsDiffPerMinDeltas
  damageTakenPerMinDeltas: CreepsPerMinDeltas
  goldPerMinDeltas: CreepsPerMinDeltas
  lane: "TOP" | "JUNGLE" | "MIDDLE" | "BOTTOM" | "SUPPORT"
  participantId: number
  role: "DUO" | "NONE" | "SOLO" | "DUO_CARRY" | "DUO_SUPPORT"
  xpDiffPerMinDeltas: CsDiffPerMinDeltas
  xpPerMinDeltas: CreepsPerMinDeltas
}

export interface CsDiffPerMinDeltas {
  [key: string]: number
}

export interface CreepsPerMinDeltas {
  [key: string]: number
}

export interface Stats {
  assists: number // 助攻数
  causedEarlySurrender: boolean // 是否导致了早期投降
  champLevel: number // 英雄等级
  combatPlayerScore: number // 战斗分数
  damageDealtToObjectives: number // 对目标的总伤害
  damageDealtToTurrets: number // 对防御塔的总伤害
  damageSelfMitigated: number // 自我减免的伤害
  deaths: number // 死亡次数
  doubleKills: number // 双杀次数
  earlySurrenderAccomplice: boolean // 是否参与了早期投降
  firstBloodAssist: boolean // 是否协助拿到一血
  firstBloodKill: boolean // 是否拿到一血
  firstInhibitorAssist: boolean // 是否协助摧毁第一座抑制器
  firstInhibitorKill: boolean // 是否摧毁了第一座抑制器
  firstTowerAssist: boolean // 是否协助摧毁第一座防御塔
  firstTowerKill: boolean // 是否摧毁了第一座防御塔
  gameEndedInEarlySurrender: boolean // 比赛是否在早期投降时结束
  gameEndedInSurrender: boolean // 比赛是否在投降时结束
  goldEarned: number // 获得的总金币
  goldSpent: number // 花费的总金币
  inhibitorKills: number // 摧毁抑制器的次数
  item0: number // 装备 0 的 ID
  item1: number // 装备 1 的 ID
  item2: number // 装备 2 的 ID
  item3: number // 装备 3 的 ID
  item4: number // 装备 4 的 ID
  item5: number // 装备 5 的 ID
  item6: number // 装备 6 的 ID（通常是饰品）
  playerAugment1: number // 增强属性 1 的 ID
  playerAugment2: number // 增强属性 2 的 ID
  playerAugment3: number // 增强属性 3 的 ID
  playerAugment4: number // 增强属性 4 的 ID
  playerAugment5: number // 增强属性 5 的 ID
  playerAugment6: number // 增强属性 6 的 ID
  killingSprees: number // 杀戮连击数
  kills: number // 击杀数
  largestCriticalStrike: number // 最大暴击伤害
  largestKillingSpree: number // 最大连续击杀
  largestMultiKill: number // 最大多重击杀
  longestTimeSpentLiving: number // 最长生存时间
  magicDamageDealt: number // 总魔法伤害
  magicDamageDealtToChampions: number // 对英雄的总魔法伤害
  magicalDamageTaken: number // 承受的魔法伤害
  neutralMinionsKilled: number // 击杀的中立小兵总数
  neutralMinionsKilledEnemyJungle: number // 击杀敌方野区的中立小兵总数
  neutralMinionsKilledTeamJungle: number // 击杀己方野区的中立小兵总数
  objectivePlayerScore: number // 玩家目标得分
  participantId: number // 参与者 ID
  pentaKills: number // 五杀次数
  perk0: number // 天赋 0 的 ID
  perk0Var1: number // 天赋 0 的变量 1
  perk0Var2: number // 天赋 0 的变量 2
  perk0Var3: number // 天赋 0 的变量 3
  perk1: number // 天赋 1 的 ID
  perk1Var1: number // 天赋 1 的变量 1
  perk1Var2: number // 天赋 1 的变量 2
  perk1Var3: number // 天赋 1 的变量 3
  perk2: number // 天赋 2 的 ID
  perk2Var1: number // 天赋 2 的变量 1
  perk2Var2: number // 天赋 2 的变量 2
  perk2Var3: number // 天赋 2 的变量 3
  perk3: number // 天赋 3 的 ID
  perk3Var1: number // 天赋 3 的变量 1
  perk3Var2: number // 天赋 3 的变量 2
  perk3Var3: number // 天赋 3 的变量 3
  perk4: number // 天赋 4 的 ID
  perk4Var1: number // 天赋 4 的变量 1
  perk4Var2: number // 天赋 4 的变量 2
  perk4Var3: number // 天赋 4 的变量 3
  perk5: number // 天赋 5 的 ID
  perk5Var1: number // 天赋 5 的变量 1
  perk5Var2: number // 天赋 5 的变量 2
  perk5Var3: number // 天赋 5 的变量 3
  perkPrimaryStyle: number // 主天赋类型
  perkSubStyle: number // 副天赋类型
  physicalDamageDealt: number // 总物理伤害
  physicalDamageDealtToChampions: number // 对英雄的总物理伤害
  physicalDamageTaken: number // 承受的物理伤害
  playerScore0: number // 玩家分数 0
  playerScore1: number // 玩家分数 1
  playerScore2: number // 玩家分数 2
  playerScore3: number // 玩家分数 3
  playerScore4: number // 玩家分数 4
  playerScore5: number // 玩家分数 5
  playerScore6: number // 玩家分数 6
  playerScore7: number // 玩家分数 7
  playerScore8: number // 玩家分数 8
  playerScore9: number // 玩家分数 9
  quadraKills: number // 四杀次数
  sightWardsBoughtInGame: number // 购买的侦查守卫数
  subteamPlacement: number // 小队名次
  teamEarlySurrendered: boolean // 队伍是否早期投降
  timeCCingOthers: number // 控制他人的总时长
  totalDamageDealt: number // 总伤害
  totalDamageDealtToChampions: number // 对英雄的总伤害
  totalDamageTaken: number // 承受的总伤害
  totalHeal: number // 总治疗量
  totalMinionsKilled: number // 击杀的小兵总数
  totalPlayerScore: number // 玩家总分
  totalScoreRank: number // 总分排名
  totalTimeCrowdControlDealt: number // 总控制时间
  totalUnitsHealed: number // 治疗的单位总数
  tripleKills: number // 三杀次数
  trueDamageDealt: number // 总真实伤害
  trueDamageDealtToChampions: number // 对英雄的真实伤害
  trueDamageTaken: number // 承受的真实伤害
  turretKills: number // 摧毁的防御塔数
  unrealKills: number // 非常规击杀次数
  visionScore: number // 视野得分
  visionWardsBoughtInGame: number // 购买的控制守卫数
  wardsKilled: number // 摧毁的守卫数
  wardsPlaced: number // 放置的守卫数
  win: boolean // 是否获胜
  playerSubteamId: number // 玩家小队 ID
}

export interface ParticipantIdentity {
  participantId: number
  player: Player
}

export interface Player {
  accountId: number
  currentAccountId: number
  currentPlatformId: string
  matchHistoryUri: string
  platformId: string
  profileIcon: number
  summonerId: number
  puuid: string
  gameName: string
  tagLine: string
  summonerName: string
}
