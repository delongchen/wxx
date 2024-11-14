import { useEffect, useRef, useCallback } from 'react';
import * as echarts from 'echarts/core';

export const useEChart = (initOptions?: echarts.ComposeOption<never>) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<echarts.EChartsType | null>(null)

  const setOptions = useCallback((options: echarts.ComposeOption<never>) => {
    if (chartInstance.current !== null) {
      chartInstance.current.setOption(options);
    }
  }, [])

  useEffect(() => {
    if (chartRef.current === null) return;

    const instance = echarts.init(chartRef.current);
    instance.setOption(initOptions ?? {});
    chartInstance.current = instance;

    return () => {
      instance.dispose()
      chartInstance.current = null
    }
  }, [])

  return {
    chartRef,
    setOptions,
  }
}
