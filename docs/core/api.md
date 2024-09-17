# Wxx Api

向前端提供与系统交互的能力
诸如文件IO LCU请求发送之类

引入

```typescript
import * as api from 'tauri-plugin-wxx-core/api'
```

## Local Config 配置文件管理

提供了读取和写入本地配置文件的工具

临时使用 将来会重构

引入

```typescript
import { 
    readLocalConfig, 
    writeLocalConfig,
    readLocalConfigWithInit,
    createConfigHandle,
} from 'tauri-plugin-wxx-core/api'
```

### `readLocalConfig`
- **功能**：从指定的命名空间和配置名称读取配置文件。
- **参数**：
  - `namespace`：命名空间，用于区分不同的配置文件。
  - `configName`：配置文件名称。
  - `configType`：配置文件的格式类型，可以是 `'json'`、`'toml'` 或 `'yaml'`，默认值是 `'json'`。

### `writeLocalConfig`
- **功能**：向本地配置文件写入数据。
- **参数**：
  - `namespace`：命名空间，用于区分不同的配置文件。
  - `configName`：配置文件名称。
  - `configType`：配置文件的格式类型，可以是 `'json'`、`'toml'` 或 `'yaml'`，默认值是 `'json'`。
  - `data`：如果为空对象则会写入一个空文件.

### `readLocalConfigWithInit`
- **功能**：读取配置文件，如果文件不存在则使用提供的默认数据进行初始化。
- **参数**：
  - `namespace`：命名空间，用于区分不同的配置文件。
  - `configName`：配置文件名称。
  - `configType`：配置文件的格式类型，可以是 `'json'`、`'toml'` 或 `'yaml'`，默认值是 `'json'`。
  - `data`：同write

### `createConfigHandle`
- **功能**：创建一个处理特定配置文件的句柄，返回可供操作的工具函数。
- **参数**：
  - `namespace`：命名空间，用于区分不同的配置文件。
  - `configName`：配置文件名称。
  - `configType`：配置文件的格式类型，可以是 `'json'`、`'toml'` 或 `'yaml'`，默认值是 `'json'`。
- **返回**：包含以下三个函数：
  - `read`：读取配置文件。
  - `readWithInit`：读取配置文件，若文件不存在则使用默认数据初始化。
  - `write`：向配置文件写入数据。

### 总结
提供了一个方便的方式来管理配置文件。如果配置文件不存在，它会自动创建并初始化文件，从而简化了配置文件的管理流程。现在只支持写入JSON


## LCU Fetch

LCU RESTFUL服务的前端代理

通过 Tauri 的 `invoke` 函数向 LCU（League Client Update，英雄联盟客户端更新）API 发送请求。

该函数支持多种 HTTP 方法，例如 `GET`、`POST`、`PUT`、`DELETE` 和 `PATCH`。你可以指定请求的 endpoint（端点），并可选择传递请求体。

引入

```typescript
import { lcuFetch } from 'tauri-plugin-wxx-core/api'
```


### 类型参数

- `T`: 从 API 返回的预期响应类型。

### 参数

- `endpoint: string`: 要发送请求的 API 端点。
- `options: object`: 请求的可选设置。
  - `method: LcuAllowedMethod`: 请求使用的 HTTP 方法，支持 `get`、`post`、`put`、`delete`、`patch`，默认为 `"get"`。
  - `body: RequestBody`: 可选的请求体（JSON 对象），若请求需要发送请求体。

### 返回值

- `Promise<T>`: 返回一个 Promise 对象，解析为指定类型 `T` 的响应数据。

### 示例

#### 例子1：进行 GET 请求

```typescript
const data = await lcuFetch<Summoner>('/lol/summoner/v1/current-summoner');
console.log(data);
```

#### 例子2：进行 POST 请求

```typescript
const response = await lcuFetch<Lobby>('/lol/lobby/v2/lobby', {
  method: 'POST',
  body: { queueId: 400 }
});
console.log(response);
```

### 预设封装

请参见下一篇 LCU Api
