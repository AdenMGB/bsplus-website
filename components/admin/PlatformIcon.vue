<template>
  <component :is="iconComponent" class="w-5 h-5 shrink-0 text-zinc-400" aria-hidden="true" />
</template>

<script setup lang="ts">
import {
  ComputerDesktopIcon,
  DevicePhoneMobileIcon,
  ServerIcon,
} from '@heroicons/vue/24/outline';

const props = defineProps<{
  platform: string;
}>();

const iconComponent = computed(() => {
  const p = (props.platform || '').toLowerCase();
  if (p.includes('android') || p.includes('ios') || p.includes('iphone')) {
    return DevicePhoneMobileIcon;
  }
  if (p.includes('linux')) {
    return ServerIcon;
  }
  return ComputerDesktopIcon;
});
</script>
