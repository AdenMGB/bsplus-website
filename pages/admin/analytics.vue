<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex items-center justify-between mb-16">
        <div>
          <NuxtLink to="/admin" class="text-sm font-semibold leading-6 text-zinc-400 hover:text-white mb-4 inline-block">&larr; Back to Dashboard</NuxtLink>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Analytics</h2>
          <p class="mt-2 text-lg text-zinc-400">Session statistics over time</p>
        </div>
        <div class="flex items-center gap-4">
          <select 
            v-model="selectedHours" 
            @change="loadData"
            class="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:border-green-500 focus:ring-0"
          >
            <option :value="24">Last 24 Hours</option>
            <option :value="48">Last 48 Hours</option>
            <option :value="168">Last 7 Days</option>
            <option :value="720">Last 30 Days</option>
          </select>
        </div>
      </div>

      <div v-if="loading" class="flex items-center justify-center py-24">
        <div class="text-zinc-400">Loading...</div>
      </div>

      <div v-else-if="chartData.length === 0" class="flex items-center justify-center py-24">
        <div class="text-zinc-400">No data available for the selected time period</div>
      </div>

      <div v-else class="space-y-8">
        <!-- Extension Sessions Chart -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Extension Sessions</h3>
          <AreaChart 
            :data="chartData" 
            :chart-config="extensionConfig"
            container-class="min-h-[300px]"
          />
        </div>

        <!-- DesQTA Sessions Chart -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4">DesQTA Sessions</h3>
          <AreaChart 
            :data="chartData" 
            :chart-config="desqtaConfig"
            container-class="min-h-[300px]"
          />
        </div>

        <!-- Combined Chart -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6">
          <h3 class="text-lg font-semibold text-white mb-4">Combined Sessions</h3>
          <AreaChart 
            :data="chartData" 
            :chart-config="combinedConfig"
            container-class="min-h-[300px]"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import AreaChart from '~/components/charts/AreaChart.vue';

definePageMeta({
  middleware: ["admin"]
});

const selectedHours = ref(24);
const loading = ref(true);
const chartData = ref<any[]>([]);

const extensionConfig = {
  extension_sessions: {
    label: 'Extension Sessions',
    color: '#4ade80', // green-400
  },
};

const desqtaConfig = {
  desqta_sessions: {
    label: 'DesQTA Sessions',
    color: '#60a5fa', // blue-400
  },
};

const combinedConfig = {
  extension_sessions: {
    label: 'Extension Sessions',
    color: '#4ade80', // green-400
  },
  desqta_sessions: {
    label: 'DesQTA Sessions',
    color: '#60a5fa', // blue-400
  },
};

async function loadData() {
  loading.value = true;
  try {
    const data = await $fetch<any[]>(`/api/analytics/hourly-stats?hours=${selectedHours.value}`);
    console.log('Analytics data received:', data);
    console.log('Data length:', data?.length);
    if (data && data.length > 0) {
      console.log('First item:', data[0]);
      console.log('Last item:', data[data.length - 1]);
    }
    chartData.value = data || [];
  } catch (e) {
    console.error('Failed to load analytics data:', e);
    chartData.value = [];
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  loadData();
});
</script>

