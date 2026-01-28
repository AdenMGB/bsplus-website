<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="flex items-center justify-between mb-16">
        <div>
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl">Daily Questions</h2>
          <p class="mt-2 text-lg text-zinc-400">Manage daily voting questions</p>
        </div>
        <NuxtLink 
          to="/admin/questionnaire/create" 
          class="flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 transition-all hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create Question
        </NuxtLink>
      </div>

      <!-- Current & Next Question -->
      <div class="mb-8">
        <h3 class="text-lg font-semibold text-white mb-4">Current & Next</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-if="currentQuestion" class="bg-zinc-900/50 border border-green-500/20 rounded-xl p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-green-400 uppercase">Currently Active</span>
              <span class="text-xs text-zinc-500">Expires: {{ currentQuestion.expires_at_formatted }}</span>
            </div>
            <h4 class="text-white font-medium mb-2">{{ currentQuestion.question }}</h4>
            <div class="flex items-center gap-2 mt-4">
              <span class="text-sm text-zinc-400">{{ currentQuestion.total_votes }} votes</span>
              <NuxtLink :to="`/admin/questionnaire/edit/${currentQuestion.id}`" class="text-xs text-indigo-400 hover:text-indigo-300">Edit</NuxtLink>
            </div>
          </div>
          <div v-if="nextQuestion" class="bg-zinc-900/50 border border-blue-500/20 rounded-xl p-6">
            <div class="flex items-center justify-between mb-2">
              <span class="text-xs font-medium text-blue-400 uppercase">Next in Queue</span>
              <span class="text-xs text-zinc-500">Auto-activates after current</span>
            </div>
            <h4 class="text-white font-medium mb-2">{{ nextQuestion.question }}</h4>
            <div class="flex items-center gap-2 mt-4">
              <span class="text-sm text-zinc-400">{{ nextQuestion.total_votes || 0 }} votes</span>
              <NuxtLink :to="`/admin/questionnaire/edit/${nextQuestion.id}`" class="text-xs text-indigo-400 hover:text-indigo-300">Edit</NuxtLink>
            </div>
          </div>
        </div>
      </div>

      <!-- Queue Management -->
      <div class="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
        <div class="px-6 py-4 border-b border-zinc-800 flex justify-between items-center">
          <h3 class="text-base font-semibold leading-7 text-white">Question Queue</h3>
          <button 
            @click="saveReorder" 
            :disabled="!hasReorderChanges || saving"
            class="text-sm font-medium text-green-400 hover:text-green-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {{ saving ? 'Saving...' : 'Save Order' }}
          </button>
        </div>
        <div class="p-6">
          <div class="space-y-2">
            <div 
              v-for="(question, index) in queuedQuestions" 
              :key="question.id"
              class="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700 hover:border-zinc-600 transition-colors cursor-move"
              draggable="true"
              @dragstart="handleDragStart(index, $event)"
              @dragover.prevent="handleDragOver(index, $event)"
              @drop="handleDrop(index, $event)"
              @dragend="handleDragEnd"
            >
              <div class="flex items-center gap-3 flex-1">
                <div class="text-zinc-500 text-sm font-mono w-8">{{ index + 1 }}</div>
                <div class="flex-1">
                  <div class="text-white font-medium">{{ question.question }}</div>
                  <div class="text-xs text-zinc-500 mt-1">{{ question.options.length }} options</div>
                </div>
              </div>
              <div class="flex items-center gap-4">
                <span class="text-sm text-zinc-400">{{ question.total_votes || 0 }} votes</span>
                <NuxtLink :to="`/admin/questionnaire/edit/${question.id}`" class="text-indigo-400 hover:text-indigo-300 text-sm">Edit</NuxtLink>
              </div>
            </div>
            <div v-if="queuedQuestions.length === 0" class="text-center py-8 text-zinc-500 italic">
              No queued questions. Create one to get started!
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

definePageMeta({
  middleware: ["admin"]
});

const { data: questions, refresh } = await useFetch<any[]>('/api/questionnaire?admin=true');

const currentQuestion = computed(() => {
  return questions.value?.find(q => q.is_active && q.expires_at * 1000 > Date.now());
});

const nextQuestion = computed(() => {
  const queued = questions.value
    ?.filter(q => !q.is_active && q.auto_activate)
    .sort((a, b) => (a.queue_order || 0) - (b.queue_order || 0));
  return queued?.[0];
});

const queuedQuestions = ref<any[]>([]);
const originalOrder = ref<string[]>([]);
const saving = ref(false);
let draggedIndex = -1;

watch(questions, (newQuestions) => {
  if (newQuestions) {
    const queued = newQuestions
      .filter(q => !q.is_active && q.auto_activate)
      .sort((a, b) => (a.queue_order || 0) - (b.queue_order || 0));
    queuedQuestions.value = queued;
    originalOrder.value = queued.map(q => q.id);
  }
}, { immediate: true });

const hasReorderChanges = computed(() => {
  return JSON.stringify(queuedQuestions.value.map(q => q.id)) !== JSON.stringify(originalOrder.value);
});

function handleDragStart(index: number, event: DragEvent) {
  draggedIndex = index;
  if (event.dataTransfer) {
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', '');
  }
}

function handleDragOver(index: number, event: DragEvent) {
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = 'move';
  }
}

function handleDrop(index: number, event: DragEvent) {
  event.preventDefault();
  if (draggedIndex === -1 || draggedIndex === index) return;
  
  const items = [...queuedQuestions.value];
  const draggedItem = items[draggedIndex];
  items.splice(draggedIndex, 1);
  items.splice(index, 0, draggedItem);
  queuedQuestions.value = items;
}

function handleDragEnd() {
  draggedIndex = -1;
}

async function saveReorder() {
  saving.value = true;
  try {
    await $fetch('/api/questionnaire/reorder', {
      method: 'POST',
      body: {
        questionIds: queuedQuestions.value.map(q => q.id)
      }
    });
    originalOrder.value = queuedQuestions.value.map(q => q.id);
    await refresh();
  } catch (e: any) {
    alert(e.data?.message || 'Failed to save order');
  } finally {
    saving.value = false;
  }
}

async function deleteQuestion(id: string) {
  if (!confirm('Are you sure you want to delete this question? This will also delete all votes.')) return;
  try {
    await $fetch(`/api/questionnaire/${id}`, { method: 'DELETE' });
    await refresh();
  } catch (e) {
    alert('Failed to delete question');
  }
}
</script>
