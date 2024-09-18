---
outline: 2
---

# Gameflow
查询和管理游戏中的状态或执行退出操作。具体来说，它们与游戏的不同阶段和会话管理有关。

引入
```typescript
import { api } from 'tauri-plugin-wxx-core/lcu-api/gameflow'
```
## getGameflowPhase
获取当前的游戏流程阶段。调用 /lol-gameflow/v1/gameflow-phase 接口，返回当前游戏流程的阶段信息。游戏流程阶段通常指的是玩家从登录、匹配、加载、游戏进行等不同状态的阶段。

例如，不同的 GameflowPhase 可能包括：

- 登录界面
- 英雄选择
- 游戏加载
- 游戏进行中
- 游戏结束
### 返回类型
[GameflowPhase](../lcu-types/gameflow/type-aliases/GameflowPhase)

## getGameflowSession
获取当前的游戏会话信息。调用 /lol-gameflow/v1/session 接口，返回当前的游戏会话的详细信息，这可能包括玩家正在进行的游戏模式、匹配状态、当前队伍信息等。
### 返回类型
[GameflowSession](../lcu-types/gameflow/interfaces/GameflowSession)

## earlyExit
发送请求以提前退出当前的游戏流程。调用 /lol-gameflow/v1/early-exit 接口执行提前退出操作，这可能会用在取消队列、退出加载界面等场景。