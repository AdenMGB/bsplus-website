<template>
  <div :class="`w-full ${containerClass || ''}`">
    <div class="min-h-[200px] w-full">
      <v-chart :option="chartOption" class="w-full h-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface ChartConfig {
  [key: string]: {
    label?: string;
    color?: string;
  };
}

const props = defineProps<{
  data: any[];
  chartConfig: ChartConfig;
  xAxisKey?: string;
  containerClass?: string;
  hours?: number;
}>();

const xAxisKey = computed(() => props.xAxisKey || 'timestamp');

const chartOption = computed(() => {
  const series = Object.keys(props.chartConfig).map((key) => {
    const config = props.chartConfig[key];
    return {
      name: config.label || key,
      type: 'line',
      data: props.data.map((item) => [item[xAxisKey.value] * 1000, item[key] || 0]),
      smooth: true,
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: config.color || '#4ade80',
            },
            {
              offset: 1,
              color: (config.color || '#4ade80') + '00', // Add transparency
            },
          ],
        },
      },
      lineStyle: {
        color: config.color || '#4ade80',
        width: 2,
      },
      itemStyle: {
        color: config.color || '#4ade80',
      },
    };
  });

  return {
    backgroundColor: 'transparent',
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true,
    },
    xAxis: {
      type: 'time',
      boundaryGap: false,
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#a1a1aa', // zinc-400
        formatter: (value: number) => {
          const date = new Date(value);
          return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#3f3f46', // zinc-700
          type: 'dashed',
        },
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        show: false,
      },
      axisTick: {
        show: false,
      },
      axisLabel: {
        color: '#a1a1aa', // zinc-400
      },
      splitLine: {
        lineStyle: {
          color: '#3f3f46', // zinc-700
          type: 'dashed',
        },
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#18181b', // zinc-900
      borderColor: '#27272a', // zinc-800
      textStyle: {
        color: '#ffffff',
      },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#18181b',
        },
      },
      formatter: (params: any) => {
        if (!params || !params.length) return '';
        const date = new Date(params[0].value[0]);
        const dateStr = date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
        let result = `<div style="margin-bottom: 4px; color: #a1a1aa;">${dateStr}</div>`;
        params.forEach((param: any) => {
          const config = props.chartConfig[param.seriesName] || {};
          result += `<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 4px;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${param.color};"></span>
            <span style="color: #a1a1aa;">${config.label || param.seriesName}:</span>
            <span style="color: #ffffff; font-weight: 500;">${param.value[1]}</span>
          </div>`;
        });
        return result;
      },
    },
    legend: {
      show: true,
      top: 0,
      textStyle: {
        color: '#ffffff',
      },
      itemGap: 20,
    },
    series,
  };
});
</script>

<style scoped>
.echarts {
  width: 100%;
  height: 100%;
}
</style>
