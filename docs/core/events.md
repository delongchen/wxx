# Events
引入方法
```typescript
import * as events from 'tauri-plugin-wxx-core/events';
```

## 前言

提供的事件相关api都是对Tauri的listen方法的基础包装

由于包装比较基础 使用时一般需要更高级的封装

相关类型定义如下
```typescript
interface Event<T> {
    /** Event name */
    event: EventName;
    /** Event identifier used to unlisten */
    id: number;
    /** Event payload */
    payload: T;
}

type EventCallback<T> = (event: Event<T>) => void;
```

包装用的工具函数如下

```typescript
const createListenFn = <T>(eventName: string) => 
    (listener: EventCallback<T>) => listen(eventName, listener);
```

## Lcu事件流

用于监听Rust侧的lcu事件流

引入

```typescript
import { listenLcuEvent } from 'tauri-plugin-wxx-core/events';
```

定义如下

```typescript
type LcuEventTypeEnum = 'Update' | 'Create' | 'Delete';

interface LcuEventType<T = unknown> {
  eventType: LcuEventTypeEnum;
  uri: string;
  data: T;
}

const listenLcuEvent = createListenFn<LcuEventType>('LCU_WS_EVENT');
```

## Lcu Process Status

用于监听lcu进程的状态

引入

```typescript
import { listenProcessStatus } from 'tauri-plugin-wxx-core/events';
```
定义如下

```typescript
enum LcuProcessStatus {
  NotStarted = 1,
  NotStartedWithAdmin,
  Started,
}

const listenProcessStatus = createListenFn<LcuProcessStatus>('LCU_PROCESS_STATUS_EVENT');
```

### 注意!
这个监听器每秒都会返回进程状态
这些状态值可能一样

要实现onProcessStatusChange请自行封装