import { use } from 'echarts/core';
import {
  GridComponent,
  TitleComponent,
  CalendarComponent,
  VisualMapComponent,
  TooltipComponent,
} from 'echarts/components';
import { LineChart, HeatmapChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { UniversalTransition } from 'echarts/features';

use([
  // canvas renderer
  CanvasRenderer,

  // features
  UniversalTransition,

  // charts
  LineChart,
  HeatmapChart,

  // components
  GridComponent,
  TitleComponent,
  CalendarComponent,
  VisualMapComponent,
  TooltipComponent,
]);
