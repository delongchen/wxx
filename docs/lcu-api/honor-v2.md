---
outline: 2
---

# Honor V2
点赞相关

引入
```typescript
import { api } from 'tauri-plugin-wxx-core/lcu-api/honor-v2'
```
## honor
给某个逼点赞 `OPT_OUT` 就是这局不行
### 负载类型
gameId: `number`

honorCategory: `'COOL' | 'SHOTCALLER' | 'HEART' | '' | 'OPT_OUT'`

summonerId?: `string | number`

puuid?: `string`

## getBallot
获取投票信息 包括了gameId 也就是honor的关键参数
### 返回类型
[BallotLegacy](../lcu-types/honorV2/interfaces/BallotLegacy)