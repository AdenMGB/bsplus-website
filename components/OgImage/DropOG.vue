<script lang="ts" setup>
/**
 * @credits Pergel <https://nuxtlabs.com/>
 * Based on https://github.com/nuxt-modules/og-image/blob/b510a7170d8feeb70790707eab7a075f6b029339/src/runtime/app/components/Templates/Community/Pergel.vue
 */
import { computed } from "vue";

const {
  title: propTitle = "title",
  description = "description",
  headline = "v0.2",
} = defineProps<{
  title?: string;
  description?: string;
  headline?: string;
}>();

const title = computed(() => propTitle.slice(0, 60));

defineOgImageComponent("DesQTAOG", {
  title: "DesQTA",
  // logo: "/favicon.png",
});
</script>

<template>
  <div class="w-full h-full flex flex-col justify-center bg-[#121212]">
    <svg
      class="absolute top-0 right-0"
      width="1200"
      height="675"
      viewBox="0 0 1200 675"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
        style="mix-blend-mode: overlay"
        opacity="0.7"
        filter="url(#filter0_f_448_25)"
      >
        <circle cx="901.5" cy="45.5" r="199.5" fill="#333333" />
        <circle cx="600.5" cy="216.5" r="199.5" fill="#444444" />
        <circle cx="179.5" cy="317.5" r="199.5" fill="#555555" />
      </g>
      <defs>
        <filter
          id="filter0_f_448_25"
          x="-240"
          y="-374"
          width="1561"
          height="1111"
          filterUnits="userSpaceOnUse"
          color-interpolation-filters="sRGB"
        >
          <feFlood flood-opacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="110"
            result="effect1_foregroundBlur_448_25"
          />
        </filter>
      </defs>
    </svg>

    <div class="w-[600px] pl-[100px]">
      <p
        v-if="headline"
        class="uppercase text-[24px] text-blue-400 mb-4 font-semibold"
      >
        {{ headline }}
      </p>
      <h1
        class="w-[600px] m-0 text-[75px] font-semibold mb-4 text-[#E0E0E0] flex items-center"
      >
        <span>{{ title }}</span>
      </h1>
      <p class="text-[32px] text-[#B0B0B0] leading-tight">
        {{ description.slice(0, 200) }}
      </p>
    </div>

    <Logo class="absolute top-[180px] right-[190px]" height="250" />
  </div>
</template>
