import * as echarts from 'echarts/core';
import { GridComponent, TitleComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { UniversalTransition } from 'echarts/features';

echarts.use([
  // canvas renderer
  CanvasRenderer,

  // features
  UniversalTransition,

  // charts
  LineChart,

  // components
  GridComponent,
  TitleComponent,
]);
