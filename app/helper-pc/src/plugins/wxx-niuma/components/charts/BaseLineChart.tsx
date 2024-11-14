import * as echarts from 'echarts/core'
import { GridComponentOption, TitleComponentOption } from 'echarts/components'
import { LineSeriesOption } from 'echarts/charts'
import { useEChart } from './EChart'

type BaseLineChartOption = echarts.ComposeOption<
  | GridComponentOption
  | LineSeriesOption
  | TitleComponentOption
>

interface BaseLineChartProps {
  xData: number[]
  yData: number[]
}

function BaseLineChart({ xData, yData }: BaseLineChartProps) {
  const options: BaseLineChartOption = {
    title: {
      text: 'title'
    },
    xAxis: {
      type: 'category',
      data: xData,
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: yData,
        type: 'line',
        smooth: true,
      }
    ]
  }

  const { chartRef } = useEChart(options)

  return (
    <div ref={chartRef} style={{height: '500px'}}></div>
  )
}

export default BaseLineChart