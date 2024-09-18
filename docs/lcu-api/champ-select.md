---
outline: 2
---

# ChampSelect
“英雄选择”（Champ Select）界面交互，进行英雄选择、禁用、换位、换肤等操作。

## getChampSelectSession
获取当前的英雄选择会话信息。这个函数调用 /lol-champ-select/v1/session API，返回英雄选择会话的详细信息，包含玩家的选择、禁用等。
### 返回类型
[ChampSelectSession](../lcu-types/champ-select/interfaces/ChampSelectSession)

## getAllGridChamps
获取所有在英雄选择界面中显示的英雄列表。它从 /lol-champ-select/v1/all-grid-champions 接口获取所有可用的英雄数据。
### 返回类型
[GridChamp](../lcu-types/champ-select/interfaces/GridChamp)[]

## pickOrBan
根据 actionId 执行一个操作，可能是选择英雄或禁用英雄。函数通过 /lol-champ-select/v1/session/actions/:actionId 的 API 发起 PATCH 请求，指定 championId（英雄ID）、completed（操作是否完成）、type（操作类型，选择或者禁用）。
### 参数类型
actionId: `number`

championId: `number`

completed: `boolean`

type: `'pick' | 'ban'`

## intentChampion
表示玩家意图选择某个英雄，使用英雄的 actionId 和 championId 发起一个意图选择的请求。
### 参数类型
actionId: `number`

championId: `number`

## getSession
获取英雄选择会话的信息，和 getChampSelectSession 类似。
### 返回类型
[ChampSelectSession](../lcu-types/champ-select/interfaces/ChampSelectSession)

## benchSwap
交换替补席上的英雄，调用 /lol-champ-select/v1/session/bench/swap/:champId 接口，交换玩家选择的英雄。
### 参数类型
champId: `number | string`

## declineTrade
拒绝当前的换英雄请求，通过调用 /lol-champ-select/v1/session/trades/:tradeId/decline 的 API 拒绝换英雄。
### 参数类型
tradeId: `number | string`

## getPickableChampIds
获取玩家当前可以选择的英雄ID列表，调用 /lol-champ-select/v1/pickable-champion-ids 接口获取可选英雄的ID数组。
### 返回类型
`number`[]

## getBannableChampIds
同上，只不过是可以ban的

## reroll
重新随机选择一个英雄，调用 /lol-champ-select/v1/session/my-selection/reroll 来执行此操作。

## getCurrentChamp
获取当前玩家所选的英雄，通过 /lol-champ-select/v1/current-champion 获取玩家当前选择的英雄信息。
### 返回类型
`number`

## getChampSelectSummoner
根据 cellId 获取玩家（召唤师）的信息，通过调用 /lol-champ-select/v1/summoners/:cellId 接口返回相应的召唤师数据。
### 参数类型
cellId: `number | string`

### 返回类型
[ChampSelectSummoner](../lcu-types/champ-select/interfaces/ChampSelectSummoner)

## setSkin
为玩家当前选择的英雄设置皮肤，调用 /lol-champ-select/v1/session/my-selection 接口，传递 selectedSkinId 来更换皮肤。
### 负载类型
selectedSkinId: `number`

## getCarouselSkins
获取皮肤轮盘中的所有皮肤，通过 /lol-champ-select/v1/skin-carousel-skins 接口返回轮盘中的皮肤列表。
### 返回类型
[CarouselSkins](../lcu-types/champ-select/interfaces/CarouselSkins)[]