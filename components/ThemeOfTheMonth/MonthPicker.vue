<template>
  <div class="flex gap-3">
    <select
      v-model="selectedMonth"
      class="flex-1 block w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
    >
      <option v-for="m in months" :key="m.value" :value="m.value">{{ m.label }}</option>
    </select>
    <select
      v-model="selectedYear"
      class="w-28 block bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
    >
      <option v-for="y in years" :key="y" :value="y">{{ y }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: string;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void;
}>();

const months = [
  { value: '01', label: 'January' },
  { value: '02', label: 'February' },
  { value: '03', label: 'March' },
  { value: '04', label: 'April' },
  { value: '05', label: 'May' },
  { value: '06', label: 'June' },
  { value: '07', label: 'July' },
  { value: '08', label: 'August' },
  { value: '09', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' }
];

const years = computed(() => {
  const current = new Date().getUTCFullYear();
  const result: number[] = [];
  for (let y = current - 2; y <= current + 5; y++) {
    result.push(y);
  }
  return result;
});

function parseValue(value: string): { year: number; month: string } {
  const match = value.match(/^(\d{4})-(0[1-9]|1[0-2])$/);
  if (match) {
    return { year: parseInt(match[1], 10), month: match[2] };
  }
  const now = new Date();
  return {
    year: now.getUTCFullYear(),
    month: String(now.getUTCMonth() + 1).padStart(2, '0')
  };
}

function emitValue(year: number, month: string) {
  emit('update:modelValue', `${year}-${month}`);
}

const selectedMonth = computed({
  get: () => parseValue(props.modelValue).month,
  set: (month: string) => {
    const { year } = parseValue(props.modelValue);
    emitValue(year, month);
  }
});

const selectedYear = computed({
  get: () => parseValue(props.modelValue).year,
  set: (year: number) => {
    const { month } = parseValue(props.modelValue);
    emitValue(year, month);
  }
});
</script>
