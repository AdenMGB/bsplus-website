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
          <h1 class="text-lg font-semibold text-white">Edit Daily Question</h1>
        </div>
        <div class="flex items-center gap-4">
          <button 
            @click="deleteQuestion" 
            class="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-all"
          >
            Delete
          </button>
          <button 
            @click="saveQuestion" 
            :disabled="loading"
            class="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {{ loading ? 'Updating...' : 'Update Question' }}
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <!-- Loading State -->
      <div v-if="loadingQuestion" class="flex items-center justify-center py-12">
        <div class="text-zinc-400">Loading question...</div>
      </div>

      <!-- Question Form -->
      <template v-else-if="question">
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

        <!-- Expiration Date/Time -->
        <div class="space-y-2">
          <label class="block text-sm font-medium text-zinc-400">
            Expiration Date & Time
            <span class="text-xs text-zinc-500 ml-2">({{ currentTimezoneLabel }})</span>
          </label>
          <input 
            v-model="expirationDateTimeLocal" 
            type="datetime-local"
            class="block w-full bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500"
          />
          <p v-if="expirationPreview" class="text-xs text-zinc-500 mt-1">
            Preview: {{ expirationPreview }}
          </p>
        </div>

        <!-- Active Status -->
        <div class="flex items-center gap-2">
          <input 
            v-model="form.is_active" 
            id="is_active" 
            type="checkbox" 
            class="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-green-500 focus:ring-green-500 focus:ring-offset-zinc-900" 
          />
          <label for="is_active" class="text-sm font-medium text-zinc-300 cursor-pointer select-none">Active</label>
        </div>

        <!-- Vote Statistics -->
        <div class="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
          <h3 class="text-sm font-semibold text-white mb-3">Vote Statistics</h3>
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm">
              <span class="text-zinc-400">Total Votes:</span>
              <span class="text-white font-medium">{{ question.total_votes }}</span>
            </div>
            <div v-for="(option, index) in question.options" :key="index" class="flex items-center justify-between text-sm">
              <span class="text-zinc-400">{{ option }}:</span>
              <span class="text-white font-medium">
                {{ question.vote_counts[`option${index + 1}`] || 0 }}
                <span class="text-zinc-500 ml-1">
                  ({{ question.total_votes > 0 ? Math.round((question.vote_counts[`option${index + 1}`] || 0) / question.total_votes * 100) : 0 }}%)
                </span>
              </span>
            </div>
          </div>
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
      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

definePageMeta({
  middleware: ["admin"],
  layout: false
});

const route = useRoute();
const router = useRouter();

const questionId = route.params.id as string;

const form = ref({
  question: '',
  options: ['', ''],
  cover_image: '',
  is_active: true
});

const expirationDateTimeLocal = ref('');
const loading = ref(false);
const loadingQuestion = ref(true);
const question = ref<any>(null);

// Get current timezone label (ACST/ACDT)
const currentTimezoneLabel = computed(() => {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Australia/Adelaide',
    timeZoneName: 'short'
  });
  const parts = formatter.formatToParts(now);
  const tzName = parts.find(p => p.type === 'timeZoneName')?.value || 'ACST';
  return tzName.includes('ACDT') ? 'ACDT' : 'ACST';
});

// Format expiration preview
const expirationPreview = computed(() => {
  if (!expirationDateTimeLocal.value) return '';
  
  try {
    const dateTime = new Date(expirationDateTimeLocal.value);
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Australia/Adelaide',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const formatted = formatter.format(dateTime);
    const tzLabel = currentTimezoneLabel.value;
    return `${formatted} ${tzLabel}`;
  } catch (e) {
    return '';
  }
});

// Load question data
onMounted(async () => {
  try {
    const data = await $fetch<any>(`/api/questionnaire/${questionId}`);
    question.value = data;
    
    form.value.question = data.question;
    form.value.options = data.options;
    form.value.cover_image = data.cover_image || '';
    form.value.is_active = data.is_active;
    
    // Convert UTC timestamp to ACST datetime-local
    const expiresAt = new Date(data.expires_at * 1000);
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Australia/Adelaide',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    
    const parts = formatter.formatToParts(expiresAt);
    const year = parts.find(p => p.type === 'year')?.value;
    const month = parts.find(p => p.type === 'month')?.value;
    const day = parts.find(p => p.type === 'day')?.value;
    const hour = parts.find(p => p.type === 'hour')?.value;
    const minute = parts.find(p => p.type === 'minute')?.value;
    
    expirationDateTimeLocal.value = `${year}-${month}-${day}T${hour}:${minute}`;
  } catch (e) {
    alert('Failed to load question');
    router.push('/admin/questionnaire');
  } finally {
    loadingQuestion.value = false;
  }
});

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

  if (!expirationDateTimeLocal.value) {
    alert('Please set an expiration date and time');
    return;
  }

  // Convert datetime-local to ACST ISO string
  // The datetime-local input value is already in the format YYYY-MM-DDTHH:mm
  // We treat this as ACST time directly (admin sets time in ACST)
  // Just ensure it has seconds
  const dateTimeStr = expirationDateTimeLocal.value;
  const expiresAtACST = dateTimeStr.includes(':') && !dateTimeStr.includes(':', dateTimeStr.indexOf(':') + 1) 
    ? `${dateTimeStr}:00` 
    : dateTimeStr;

  loading.value = true;
  try {
    await $fetch(`/api/questionnaire/${questionId}`, {
      method: 'PUT',
      body: {
        question: form.value.question,
        options: validOptions,
        expiresAt: expiresAtACST,
        cover_image: form.value.cover_image || undefined,
        is_active: form.value.is_active
      }
    });
    router.push('/admin/questionnaire');
  } catch (e: any) {
    alert(e.data?.message || 'Failed to update question');
    console.error(e);
  } finally {
    loading.value = false;
  }
}

async function deleteQuestion() {
  if (!confirm('Are you sure you want to delete this question? This will also delete all votes.')) return;
  
  try {
    await $fetch(`/api/questionnaire/${questionId}`, { method: 'DELETE' });
    router.push('/admin/questionnaire');
  } catch (e) {
    alert('Failed to delete question');
  }
}
</script>
