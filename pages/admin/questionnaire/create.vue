<template>
  <div class="min-h-screen bg-zinc-950 flex flex-col">
    <!-- Top Bar -->
    <header class="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin/questionnaire" class="text-zinc-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
            </svg>
          </NuxtLink>
          <h1 class="text-lg font-semibold text-white">Create Daily Question</h1>
        </div>
        <button 
          @click="saveQuestion" 
          :disabled="loading"
          class="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {{ loading ? 'Creating...' : 'Create Question' }}
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <!-- Question Input -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-zinc-400">Question</label>
        <input 
          v-model="form.question" 
          type="text" 
          placeholder="Enter your question here..."
          class="block w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
        />
      </div>

      <!-- Options -->
      <div class="space-y-4">
        <label class="block text-sm font-medium text-zinc-400">Options (2-4 required)</label>
        <div v-for="(option, index) in form.options" :key="index" class="flex items-center gap-2">
          <input 
            v-model="form.options[index]" 
            type="text" 
            :placeholder="`Option ${index + 1}`"
            class="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white placeholder:text-zinc-600 focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <button 
            v-if="form.options.length > 2 && index >= 2"
            @click="removeOption(index)"
            class="text-red-400 hover:text-red-300 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
        <button 
          v-if="form.options.length < 4"
          @click="addOption"
          class="text-sm text-green-400 hover:text-green-300 transition-colors flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Option
        </button>
      </div>

      <!-- Duration -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-zinc-400">Duration</label>
        <select 
          v-model="selectedDuration" 
          class="block w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
        >
          <option value="1">1 Day</option>
          <option value="3">3 Days</option>
          <option value="7">1 Week</option>
          <option value="14">2 Weeks</option>
          <option value="30">1 Month</option>
        </select>
        <p class="text-xs text-zinc-500 mt-1">
          Question will auto-activate when the previous one expires
        </p>
      </div>

      <!-- Cover Image -->
      <div class="space-y-2">
        <label class="block text-sm font-medium text-zinc-400">Cover Image (Optional)</label>
        <div class="flex items-center gap-4">
          <div v-if="form.cover_image" class="relative group h-32 w-48 rounded-lg overflow-hidden border border-zinc-700 bg-zinc-900">
            <img :src="form.cover_image" alt="Cover" class="h-full w-full object-cover" />
            <button @click="form.cover_image = ''" class="absolute top-1 right-1 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
          <div v-else class="h-32 w-48 rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/50 flex flex-col items-center justify-center text-zinc-500 hover:border-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer relative">
            <input type="file" accept="image/*" @change="handleCoverImageUpload" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 mb-1">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
            <span class="text-xs">Upload Cover</span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

definePageMeta({
  middleware: ["admin"],
  layout: false
});

const router = useRouter();

const form = ref({
  question: '',
  options: ['', ''],
  cover_image: ''
});

const selectedDuration = ref('3'); // Default to 3 days
const loading = ref(false);

function addOption() {
  if (form.value.options.length < 4) {
    form.value.options.push('');
  }
}

function removeOption(index: number) {
  if (form.value.options.length > 2) {
    form.value.options.splice(index, 1);
  }
}

async function handleCoverImageUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  if (!input.files || input.files.length === 0) return;

  const file = input.files[0];
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response: any = await $fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.url) {
      form.value.cover_image = response.url;
    }
  } catch (error) {
    console.error('Image upload failed', error);
    alert('Failed to upload image');
  } finally {
    input.value = '';
  }
}

async function saveQuestion() {
  if (!form.value.question.trim()) {
    alert('Please enter a question');
    return;
  }

  const validOptions = form.value.options.filter(opt => opt.trim());
  if (validOptions.length < 2) {
    alert('Please provide at least 2 options');
    return;
  }

  loading.value = true;
  try {
    // Queue-based: use duration
    const durationDays = parseInt(selectedDuration.value);
    const body = {
      question: form.value.question,
      options: validOptions,
      cover_image: form.value.cover_image || undefined,
      duration: durationDays * 24 * 60 * 60, // Convert to seconds
      auto_activate: true
    };
    
    // Get next queue order
    const { data: questions } = await useFetch<any[]>('/api/questionnaire?admin=true');
    const maxOrder = questions.value?.reduce((max, q) => Math.max(max, q.queue_order || 0), 0) || 0;
    body.queue_order = maxOrder + 1;

    await $fetch('/api/questionnaire/create', {
      method: 'POST',
      body
    });
    router.push('/admin/questionnaire');
  } catch (e: any) {
    alert(e.data?.message || 'Failed to create question');
  } finally {
    loading.value = false;
  }
}
</script>
