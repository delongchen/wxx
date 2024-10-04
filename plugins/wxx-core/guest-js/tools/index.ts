export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry<T>(
  asyncTask: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  increaseFactor: number = 1.5 // 增加延迟的倍数
): Promise<T> {
  return asyncTask().catch(async (err) => {
    if (maxRetries > 1) {
      await delay(baseDelay); // 等待当前的延迟时间
      return withRetry(asyncTask, maxRetries - 1, baseDelay * increaseFactor, increaseFactor); // 递增延迟并重试
    }
    throw err; // 达到最大重试次数后抛出错误
  });
}
