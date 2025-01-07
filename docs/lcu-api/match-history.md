---
outline: 2
---

# Match History
获取历史对局相关

引入
```typescript
import { api } from 'tauri-plugin-wxx-core/lcu-api/match-history'
```
## getCurrentSummonerMatchHistory
获取最近20局对局信息
### 返回类型
[MatchHistory](../lcu-types/match-history/interfaces/MatchHistory)

## getMatchHistory
获取指定puuid的历史对局
> [!NOTE]
> 一次最多获取20场对局信息

> 查询对象必须跟登录账号同大区
### 参数类型
```typescript
interface Params {
    puuid: string
    begIndex: string | number
    endIndex: string | number
}
```
### 返回类型
[MatchHistory](../lcu-types/match-history/interfaces/MatchHistory)

## getGameDetail
上面方法获取的对局信息是不全的

一般需要配合此方法来获取完整信息
### 参数类型
gameId: `string | number`
### 返回类型
[Game](../lcu-types/match-history/interfaces/Game)