import { useEffect, useRef, useCallback } from 'react';
import { init, type EChartsType, type ComposeOption } from 'echarts/core';

export const useEChart = <T extends ComposeOption<never>>(initOptions?: T) => {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const chartInstance = useRef<EChartsType | null>(null);

  const setOptions = useCallback((options: T) => {
    if (chartInstance.current !== null) {
      chartInstance.current.setOption(options);
    }
  }, []);

  useEffect(() => {
    if (chartRef.current === null) return;

    const instance = init(chartRef.current);
    instance.setOption(initOptions ?? {});
    chartInstance.current = instance;

    return () => {
      instance.dispose();
      chartInstance.current = null;
    };
  }, []);

  return {
    chartRef,
    setOptions,
  };
};
