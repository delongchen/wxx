# LCU Api Desc

上文中的`lcuFetch`函数只提供了最基础的请求功能

考虑到LCU的请求就那么几个 就提前预设了请求函数
(未完成全部覆盖)

这些方法都使用工具函数封装 实现较为复杂 详情请参见`Api Helper`

拆分为了若干模块 可以使用以下方法引用
```typescript
import { some_api } from 'tauri-plugin-wxx-core/lcu-api/<module_name>'
```

各模块详细描述在[LCU APIs](../lcu-api/index)
