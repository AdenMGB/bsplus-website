<template>
  <div :class="`w-full ${containerClass || ''}`" ref="containerRef">
    <div v-if="!hasData" class="flex flex-col items-center justify-center min-h-[300px] text-zinc-500 dark:text-zinc-400">
      <p class="text-lg font-medium">No data available</p>
      <p class="text-sm">No data points for the selected time period</p>
    </div>
    <div v-else class="w-full chart-container">
      <v-chart 
        :option="chartOption" 
        class="w-full h-full"
        autoresize
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

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

const containerRef = ref<HTMLElement | null>(null);
const xAxisKey = computed(() => props.xAxisKey || 'timestamp');

const hasData = computed(() => {
  if (!props.data || props.data.length === 0) return false;
  const keys = Object.keys(props.chartConfig);
  return props.data.some(item => 
    keys.some(key => item[key] !== undefined && item[key] !== null)
  );
});

const chartOption = computed(() => {
  if (!hasData.value) {
    return {};
  }

  const series = Object.keys(props.chartConfig).map((key) => {
    const config = props.chartConfig[key];
    
    // Filter out null/undefined values and map to [timestamp_ms, value] format
    const seriesData = props.data
      .filter(item => item[key] !== undefined && item[key] !== null)
      .map((item) => {
        const timestamp = item[xAxisKey.value];
        // Convert seconds to milliseconds if timestamp is in seconds
        const timestampMs = timestamp < 1e12 ? timestamp * 1000 : timestamp;
        return [timestampMs, item[key] || 0];
      })
      .sort((a, b) => a[0] - b[0]); // Sort by timestamp
    
    return {
      name: config.label || key,
      type: 'line',
      data: seriesData,
      smooth: true,
      symbol: 'none',
      sampling: 'lttb',
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
              opacity: 0.8,
            },
            {
              offset: 1,
              color: config.color || '#4ade80',
              opacity: 0.1,
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
      emphasis: {
        focus: 'series',
      },
    };
  });

  // Determine time format based on data range
  const timestamps = props.data
    .map(item => {
      const ts = item[xAxisKey.value];
      return ts < 1e12 ? ts * 1000 : ts;
    })
    .filter(ts => ts && !isNaN(ts));
  
  const isDaily = timestamps.length > 0 
    ? (Math.max(...timestamps) - Math.min(...timestamps)) > 24 * 60 * 60 * 1000
    : false;

  return {
    backgroundColor: 'transparent',
    animation: true,
    animationDuration: 750,
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
        color: '#ffffff',
        formatter: (value: number) => {
          const date = new Date(value);
          if (isDaily) {
            return date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit'
            });
          }
          return date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit' 
          });
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#3f3f46',
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
        color: '#ffffff',
        formatter: (value: number) => {
          return Math.round(value).toString();
        },
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#3f3f46',
          type: 'dashed',
        },
      },
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#18181b',
      borderColor: '#27272a',
      borderWidth: 1,
      textStyle: {
        color: '#ffffff',
      },
      axisPointer: {
        type: 'cross',
        label: {
          backgroundColor: '#18181b',
          color: '#ffffff',
        },
      },
      formatter: (params: any) => {
        if (!params || !params.length) return '';
        const date = new Date(params[0].value[0]);
        const dateStr = date.toLocaleString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        });
        let result = `<div style="margin-bottom: 8px; color: #a1a1aa; font-size: 12px;">${dateStr}</div>`;
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
.chart-container {
  min-height: 300px;
  height: 300px;
}

.echarts {
  width: 100%;
  height: 100%;
  min-height: 300px;
}
</style>
