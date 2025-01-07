import { useEChart } from './EChart';
import type { ComposeOption } from 'echarts/core';
import type {
  TitleComponentOption,
  CalendarComponentOption,
  TooltipComponentOption,
  VisualMapComponentOption,
} from 'echarts/components';
import { Box } from '@chakra-ui/react';
import type { HeatmapSeriesOption } from 'echarts/charts';
import { useEffect } from 'react';

type DailyGameChartOption = ComposeOption<
  | TitleComponentOption
  | CalendarComponentOption
  | TooltipComponentOption
  | VisualMapComponentOption
  | HeatmapSeriesOption
>;

type DailyTuple = [string, number, number]

interface DailyGameChartProps {
  tuples: DailyTuple[];
}

const splitTuplesByYear = (tuples: DailyTuple[]): [string, DailyTuple[]][] => {
  const yearMap: Map<string, DailyTuple[]> = new Map();

  for (const t of tuples) {
    const [date] = t;
    const [y] = date.split('-');
    const exist = yearMap.get(y);
    if (exist === undefined) {
      yearMap.set(y, [t]);
    } else {
      exist.push(t);
    }
  }

  return [...yearMap].sort((a, b) => +a[0] - +b[0]);
};

const getOption = (tuples: DailyTuple[]): DailyGameChartOption => {
  const tuplesWithYear = splitTuplesByYear(tuples);

  const option: DailyGameChartOption = {
    tooltip: {
      formatter: (p) => {
        const value = Reflect.get(p, 'value') as [string, number];
        const { extra } = Reflect.get(p, 'data') as { extra: { win: number } };

        return `${value[0]} ${value[1]}场 胜率: ${(100 * extra.win / value[1]) << 0}%`;
      },
    },
  };

  option.visualMap = {
    show: false,
    pieces: [
      { min: 0, max: 0, color: '#ebedf0' }, // 无数据或最少贡献，浅灰色
      { min: 1, max: 5, color: '#c6e48b' }, // 浅绿
      { min: 6, max: 10, color: '#7bc96f' }, // 绿色
      { min: 11, max: 15, color: '#239a3b' }, // 深绿
      { min: 16, color: '#196127' },          // 最深绿
    ],
  };

  option.calendar = tuplesWithYear.map(([year]) => {
    return {
      cellSize: [20, 20],
      range: year,
      itemStyle: {
        borderWidth: 0.5,
      },
      yearLabel: { show: true },
    };
  });

  option.series = tuplesWithYear.map(([, raw]) => {
    return {
      data: raw.map(([date, count, win]) => ({
        value: [date, count],
        extra: { win },
      })),
      type: 'heatmap',
      coordinateSystem: 'calendar',
    };
  });

  return option;
};

function DailyGameChart(props: DailyGameChartProps) {
  const { chartRef, setOptions } = useEChart();

  const option = getOption(props.tuples);
  const series = option.series as [] ?? [];

  useEffect(() => {
    setOptions(option);
  }, []);

  return <Box ref={chartRef} h={`${series.length * 250}px`} />;
}

export default DailyGameChart;