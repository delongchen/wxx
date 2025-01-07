---
outline: [1, 2]
---

# Lobby
房间内相关API

引入
```typescript
import { api } from 'tauri-plugin-wxx-core/lcu-api/lobby'
```
## createQueueLobby
创建排位房间
### 负载类型
queueId: `number`

## promote
转让房主
### 参数类型
summonerId: `number`
### 返回类型
`number`

## kick
踢掉某个逼
类型同[promote](#promote)

## getMenbers
获取当前房间人员信息
### 返回类型
[LobbyMember](../lcu-types/lobby/interfaces/LobbyMember)[]

## getEogStatus
好像没什么用

# 其他操作
这是一些操作API 也就是无参数无返回
## searchMatch
查找对局
## deleteSearchMatch
取消查找对局
## playAgain
再来一把