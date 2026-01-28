<template>
  <div v-if="question" class="fixed bottom-4 right-4 z-50 max-w-md w-full sm:w-96">
    <div class="bg-zinc-900/95 border border-zinc-800 rounded-lg backdrop-blur-sm shadow-xl transition-all duration-200">
      <!-- Minimized State -->
      <div v-if="isMinimized" class="p-3 cursor-pointer" @click="isMinimized = false">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-white truncate">{{ question.question }}</span>
          <button class="text-zinc-400 hover:text-white transition-colors ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
              <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
      
      <!-- Expanded State -->
      <div v-else class="p-4 md:p-6">
        <div class="flex items-start justify-between mb-3">
          <h3 class="text-lg font-semibold text-white flex-1 pr-2">{{ question.question }}</h3>
          <div class="flex items-center gap-2 flex-shrink-0">
            <div class="text-xs text-zinc-400">
              <span>Expires: {{ formatExpiration }}</span>
            </div>
            <button @click="isMinimized = true" class="text-zinc-400 hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                <path fill-rule="evenodd" d="M5.23 13.79a.75.75 0 011.06-.02L10 8.832l3.71 4.938a.75.75 0 11-1.08 1.04l-4.25-4.5a.75.75 0 010-1.08l4.25-4.5a.75.75 0 111.08 1.04L10 8.832l-3.71-4.938a.75.75 0 01-1.06-1.04l4.25 4.5a.75.75 0 010 1.08l-4.25 4.5z" clip-rule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        <div class="flex flex-col gap-4">
          <!-- Cover Image -->
          <div v-if="question.cover_image" class="w-full">
            <img 
              :src="question.cover_image" 
              :alt="question.question"
              class="w-full h-32 object-cover rounded-lg"
            />
          </div>
            
          <!-- Options -->
          <div v-if="!hasVoted && !showResults" class="space-y-2">
            <button
              v-for="(option, index) in question.options"
              :key="index"
              @click="handleVote(index + 1)"
              :disabled="voting"
              class="w-full text-left px-4 py-2 rounded-lg bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700 hover:border-accent-ring text-white transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {{ option }}
            </button>
          </div>
          
          <!-- Results -->
          <div v-if="hasVoted || showResults" class="space-y-2">
            <div
              v-for="(result, index) in results"
              :key="index"
              class="relative"
            >
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm text-zinc-300">{{ result.text }}</span>
                <span class="text-sm font-medium text-white">{{ result.percentage }}% ({{ result.count }})</span>
              </div>
              <div class="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  class="h-full bg-indigo-500 transition-all duration-500"
                  :style="{ width: `${Math.max(0, Math.min(100, result.percentage))}%` }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- View Results Button (if voted but results not loaded) -->
          <button
            v-if="hasVoted && !showResults && !results.length"
            @click="loadResults"
            :disabled="loadingResults"
            class="mt-3 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50"
          >
            {{ loadingResults ? 'Loading...' : 'View Results' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Sign In Modal -->
    <TransitionRoot as="template" :show="showSignInModal">
      <Dialog as="div" class="relative z-50" @close="showSignInModal = false">
        <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0" enter-to="opacity-100" leave="ease-in duration-200" leave-from="opacity-100" leave-to="opacity-0">
          <div class="fixed inset-0 bg-zinc-950 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div class="fixed inset-0 z-50 w-screen overflow-y-auto">
          <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <TransitionChild as="template" enter="ease-out duration-300" enter-from="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95" enter-to="opacity-100 translate-y-0 sm:scale-100" leave="ease-in duration-200" leave-from="opacity-100 translate-y-0 sm:scale-100" leave-to="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95">
              <DialogPanel class="relative transform overflow-hidden rounded-lg bg-zinc-900 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-6 border border-zinc-800">
                <div>
                  <div class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500/10">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="h-6 w-6 text-indigo-400">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                    </svg>
                  </div>
                  <div class="mt-3 text-center sm:mt-5">
                    <DialogTitle as="h3" class="text-lg font-semibold leading-6 text-white">Sign In to Vote</DialogTitle>
                    <div class="mt-2">
                      <p class="text-sm text-zinc-400">
                        You need to be signed in to vote on daily questions. Sign in to participate!
                      </p>
                    </div>
                  </div>
                </div>
                <div class="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <button
                    type="button"
                    @click="handleSignIn"
                    class="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-span-2"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    @click="showSignInModal = false"
                    class="mt-3 inline-flex w-full justify-center rounded-md bg-zinc-800 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 sm:col-span-2 sm:mt-0"
                  >
                    Cancel
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </TransitionRoot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { Dialog, DialogPanel, DialogTitle, TransitionChild, TransitionRoot } from '@headlessui/vue';
import { useAuth } from '~/composables/useAuth';

interface Question {
  id: string;
  question: string;
  options: string[];
  cover_image?: string;
  expires_at: number;
}

interface Result {
  index: number;
  text: string;
  count: number;
  percentage: number;
}

// Fetch current question
interface CurrentQuestion {
  id: string;
  question: string;
  options: string[];
  cover_image?: string;
  expires_at: number;
  created_at: number;
}

// Fetch question server-side only, then allow client-side refresh
const { data: currentQuestion } = useFetch<CurrentQuestion | null>('/api/questionnaire/current', {
  server: true,
  lazy: false
});

const question = computed(() => currentQuestion.value);

const { user, login } = useAuth();

const hasVoted = ref(false);
const voting = ref(false);
const showResults = ref(false);
const results = ref<Result[]>([]);
const loadingResults = ref(false);
const isMinimized = ref(false);
const showSignInModal = ref(false);
// Optimistic vote counts (client-side only, before server sync)
const optimisticVotes = ref<Map<number, number>>(new Map());

const formatExpiration = computed(() => {
  if (!question.value) return '';
  
  const expiresAt = question.value.expires_at * 1000;
  const now = Date.now();
  const diff = expiresAt - now;
  
  if (diff <= 0) return 'Expired';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
});

async function checkVoteStatus() {
  if (!question.value) return;
  
  try {
    const data = await $fetch<{ hasVoted: boolean }>(`/api/questionnaire/has-voted?questionId=${question.value.id}`);
    hasVoted.value = data.hasVoted;
    
    if (hasVoted.value) {
      await loadResults();
    }
  } catch (e) {
    // Silently fail - user might not be logged in
  }
}

async function handleVote(optionIndex: number) {
  if (!question.value || voting.value) return;
  
  // Check if user is authenticated
  if (!user.value) {
    showSignInModal.value = true;
    return;
  }
  
  voting.value = true;
  
  // Optimistic update: immediately show +1 vote client-side
  const currentOptimistic = optimisticVotes.value.get(optionIndex) || 0;
  optimisticVotes.value.set(optionIndex, currentOptimistic + 1);
  
  // Update results optimistically if already loaded
  if (results.value.length > 0) {
    const resultIndex = results.value.findIndex(r => r.index === optionIndex);
    if (resultIndex >= 0) {
      const result = results.value[resultIndex];
      result.count += 1;
      const totalVotes = results.value.reduce((sum, r) => sum + r.count, 0);
      results.value.forEach(r => {
        r.percentage = (r.count / totalVotes) * 100;
      });
    }
  }
  
  try {
    await $fetch('/api/questionnaire/vote', {
      method: 'POST',
      body: {
        questionId: question.value.id,
        optionIndex
      }
    });
    
    hasVoted.value = true;
    // Load actual results from server (will include buffered votes)
    await loadResults();
    // Clear optimistic votes after loading real results
    optimisticVotes.value.clear();
  } catch (e: any) {
    // Revert optimistic update on error
    const currentOptimistic = optimisticVotes.value.get(optionIndex) || 0;
    if (currentOptimistic > 0) {
      optimisticVotes.value.set(optionIndex, currentOptimistic - 1);
    }
    
    // Revert results if they were updated
    if (results.value.length > 0) {
      const resultIndex = results.value.findIndex(r => r.index === optionIndex);
      if (resultIndex >= 0) {
        const result = results.value[resultIndex];
        result.count = Math.max(0, result.count - 1);
        const totalVotes = results.value.reduce((sum, r) => sum + r.count, 0);
        results.value.forEach(r => {
          r.percentage = totalVotes > 0 ? (r.count / totalVotes) * 100 : 0;
        });
      }
    }
    
    // Handle 401 (unauthorized) with sign-in modal
    if (e.statusCode === 401) {
      showSignInModal.value = true;
    } else {
      alert(e.data?.message || 'Failed to vote. Please try again.');
    }
  } finally {
    voting.value = false;
  }
}

function handleSignIn() {
  showSignInModal.value = false;
  login();
}

async function loadResults() {
  if (!question.value || loadingResults.value) return;
  
  loadingResults.value = true;
  try {
    const data = await $fetch<{
      questionId: string;
      totalVotes: number;
      options: Result[];
    }>(`/api/questionnaire/results?questionId=${question.value.id}`);
    
    // Apply optimistic votes to server results
    const serverResults = data.options.map(opt => {
      const optimisticCount = optimisticVotes.value.get(opt.index) || 0;
      return {
        ...opt,
        count: opt.count + optimisticCount
      };
    });
    
    // Recalculate percentages with optimistic votes
    const totalVotes = serverResults.reduce((sum, r) => sum + r.count, 0);
    results.value = serverResults.map(r => ({
      ...r,
      percentage: totalVotes > 0 ? (r.count / totalVotes) * 100 : 0
    }));
    
    showResults.value = true;
  } catch (e: any) {
    if (e.statusCode === 403) {
      // User hasn't voted yet
      showResults.value = false;
    }
  } finally {
    loadingResults.value = false;
  }
}

watch(() => question.value, (newQuestion) => {
  if (newQuestion) {
    hasVoted.value = false;
    showResults.value = false;
    results.value = [];
    isMinimized.value = false;
    checkVoteStatus();
  }
}, { immediate: true });

onMounted(() => {
  if (question.value) {
    checkVoteStatus();
  }
});
</script>
