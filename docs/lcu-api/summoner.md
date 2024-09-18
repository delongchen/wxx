---
outline: 2
---

# Summoner
引入
```typescript
import {
    getCurrentSummoner,
    getSummoner,
    getSummonerByPuuid,
    updateSummonerProfile,
} from 'tauri-plugin-wxx-core/lcu-api/summoner'
```

## getCurrentSummoner
### 返回类型
[SummonerInfo](../lcu-types/summoner/interfaces/SummonerInfo)

## getSummoner
获取指定summonerId的召唤师信息
### 参数类型
id: `string | number`
### 返回类型
[SummonerInfo](../lcu-types/summoner/interfaces/SummonerInfo)

## getSummonerByPuuid
同[getSummoner](#getsummoner) 只不过换成了puuid

## updateSummonerProfile
如题
### 负载类型
key: `string`

value: `any`

inventory?: `string`