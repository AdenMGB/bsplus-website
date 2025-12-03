<template>
  <div class="min-h-screen bg-zinc-950 flex flex-col">
    <!-- Top Bar -->
    <header class="border-b border-zinc-800 bg-zinc-900/50 backdrop-blur sticky top-0 z-10">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <NuxtLink to="/admin" class="text-zinc-400 hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
              <path fill-rule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z" clip-rule="evenodd" />
            </svg>
          </NuxtLink>
          <h1 class="text-lg font-semibold text-white">{{ isEditing ? 'Edit News Post' : 'Create News Post' }}</h1>
        </div>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2" v-if="!form.published && isEditing">
             <div class="relative group">
               <button 
                 @click="showPreviewMenu = !showPreviewMenu"
                 class="text-sm font-medium text-zinc-300 hover:text-white transition-colors flex items-center gap-1"
               >
                 <span>Preview</span>
                 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                   <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd" />
                 </svg>
               </button>
               
               <div v-if="showPreviewMenu" class="absolute right-0 top-full mt-2 w-72 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-4 z-50">
                 <div class="space-y-4">
                   <div>
                     <label class="block text-xs font-medium text-zinc-400 mb-1">Duration</label>
                     <select v-model="previewDuration" class="w-full bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-sm text-zinc-300 focus:border-green-500 focus:ring-0">
                       <option :value="5">5 Minutes</option>
                       <option :value="10">10 Minutes</option>
                       <option :value="30">30 Minutes</option>
                       <option :value="60">1 Hour</option>
                       <option :value="360">6 Hours</option>
                       <option :value="720">12 Hours</option>
                     </select>
                   </div>
                   
                   <button 
                     @click="generatePreview" 
                     :disabled="generatingPreview"
                     class="w-full rounded bg-zinc-800 px-3 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-700 border border-zinc-700 transition-colors"
                   >
                     {{ generatingPreview ? 'Generating...' : 'Generate Link' }}
                   </button>

                   <div v-if="previewLink" class="space-y-2 pt-2 border-t border-zinc-800">
                     <p class="text-xs text-green-500 font-medium">Preview link active!</p>
                     <div class="flex gap-2">
                       <input readonly :value="previewLink" class="flex-1 bg-zinc-950 border border-zinc-700 rounded px-2 py-1 text-xs text-zinc-400 font-mono" />
                       <button @click="copyPreviewLink" class="text-zinc-400 hover:text-white">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4">
                           <path d="M7 3.5A1.5 1.5 0 018.5 2h3.879a1.5 1.5 0 011.06.44l3.122 3.12a1.5 1.5 0 01.439 1.061V16.5a1.5 1.5 0 01-1.5 1.5h-4a1.5 1.5 0 01-1.5-1.5v-2.25A.75.75 0 009.25 14h-2.5A.75.75 0 006 14.75v2.25A2.25 2.25 0 013.75 19.25h-1.5A2.25 2.25 0 010 17v-5.5a2.25 2.25 0 012.25-2.25h.75a.75.75 0 00.75-.75v-2.5a.75.75 0 00-.75-.75h-.75A2.25 2.25 0 010 3V2.25A2.25 2.25 0 012.25 0h2.5A2.25 2.25 0 017 2.25v1.25z" />
                           <path fill-rule="evenodd" d="M12.75 6.75a.75.75 0 01.75-.75 2.25 2.25 0 012.25 2.25v6.5a2.25 2.25 0 01-2.25 2.25h-5.5a2.25 2.25 0 01-2.25-2.25v-6.5a2.25 2.25 0 012.25-2.25h5.5zM12.75 16.5a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v.75a.75.75 0 00.75.75h5.5a.75.75 0 00.75-.75v-.75z" clip-rule="evenodd" />
                         </svg>
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
               
               <!-- Backdrop to close -->
               <div v-if="showPreviewMenu" @click="showPreviewMenu = false" class="fixed inset-0 z-40 cursor-default"></div>
             </div>
          </div>

          <div class="flex items-center gap-2">
             <input 
              v-model="form.published" 
              id="published" 
              type="checkbox" 
              class="h-4 w-4 rounded border-zinc-700 bg-zinc-800 text-green-500 focus:ring-green-500 focus:ring-offset-zinc-900" 
            />
            <label for="published" class="text-sm font-medium text-zinc-300 cursor-pointer select-none">Publish</label>
          </div>
          <button 
            @click="savePost" 
            :disabled="loading"
            class="rounded-md bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {{ loading ? 'Saving...' : (isEditing ? 'Update Post' : 'Publish Post') }}
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <!-- Title Input -->
      <div class="space-y-4">
        <input 
          v-model="form.title" 
          type="text" 
          placeholder="Post Title"
          class="block w-full bg-transparent border-0 text-4xl font-bold text-white placeholder:text-zinc-600 focus:ring-0 px-0 py-2"
        />
        <div class="flex items-center gap-2 text-sm text-zinc-500">
          <span class="font-mono">slug:</span>
          <input 
            v-model="form.slug" 
            @input="handleSlugInput"
            type="text" 
            class="bg-transparent border-0 text-sm text-zinc-400 focus:ring-0 p-0 w-full font-mono placeholder:text-zinc-700"
            placeholder="auto-generated-slug"
          />
        </div>
      </div>

      <!-- Cover Image Input -->
      <div class="space-y-2">
         <label class="block text-sm font-medium text-zinc-400">Cover Image</label>
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

      <!-- Editor -->
      <div class="flex-1 min-h-[500px] border border-zinc-800 rounded-lg overflow-hidden bg-zinc-900/30">
        <ClientOnly>
          <TiptapEditor v-model="form.content" class="h-full" />
        </ClientOnly>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { nextTick } from 'vue'

definePageMeta({
  middleware: ["admin"],
  layout: false // Use custom full-screen layout logic
});

const route = useRoute();
const router = useRouter();
const isEditing = computed(() => route.path.includes('/edit/'));

const form = ref({
  title: '',
  slug: '',
  content: '',
  published: true,
  cover_image: ''
});

const loading = ref(false);

const showPreviewMenu = ref(false);
const previewDuration = ref(60);
const generatingPreview = ref(false);
const previewLink = ref('');

let oldTitle = '';

// If editing, fetch existing post
if (isEditing.value) {
  const slug = route.params.slug as string;
  if (slug) {
    const { data: post, error } = await useFetch<any>(`/api/news/${slug}`);
    if (post.value) {
      form.value = {
        title: post.value.title,
        slug: post.value.slug,
        content: post.value.content,
        published: !!post.value.published,
        cover_image: post.value.cover_image || ''
      };
      
      // If there's an existing valid preview token, we could technically reconstruct the link
      // But we don't return the token in the public GET API for security (unless we add it to the admin response)
      // For now, we start with no link shown until generated.
      
      oldTitle = post.value.title;
    } else if (error.value) {
      alert('Failed to load post');
      router.push('/admin');
    }
  }
}

async function generatePreview() {
  if (!isEditing.value) return;
  
  generatingPreview.value = true;
  try {
    const { token } = await $fetch<any>(`/api/news/preview?slug=${encodeURIComponent(form.value.slug)}`, {
      method: 'POST',
      body: { duration: previewDuration.value }
    });
    
    // Construct full URL
    const baseUrl = window.location.origin;
    previewLink.value = `${baseUrl}/news/${form.value.slug}?preview=${token}`;
    
  } catch (e) {
    console.error(e);
    alert('Failed to generate preview link');
  } finally {
    generatingPreview.value = false;
  }
}

function copyPreviewLink() {
  navigator.clipboard.writeText(previewLink.value);
  alert('Link copied to clipboard!');
  showPreviewMenu.value = false;
}

// Auto-generate slug from title (only if slug is empty or matches old auto-generated one)
watch(() => form.value.title, (newTitle) => {
  if (!isEditing.value && (!form.value.slug || form.value.slug === slugify(oldTitle))) {
    form.value.slug = slugify(newTitle);
  }
});

watch(() => form.value.title, (val) => oldTitle = val);

// Handle manual slug input - convert spaces to dashes
function handleSlugInput(event: Event) {
  const target = event.target as HTMLInputElement;
  const value = target.value;
  
  // Convert spaces to dashes and clean up, but preserve trailing dash if it came from a space
  let processed = value
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-');        // Replace multiple - with single -
  
  // Preserve trailing dash if original value ended with space
  const endsWithSpace = value.trimEnd() !== value;
  if (endsWithSpace && processed && !processed.endsWith('-')) {
    processed += '-';
  }
  
  // Trim leading dashes but preserve trailing if it came from space
  processed = processed.replace(/^-+/, '');
  
  if (processed !== value) {
    const cursorPos = target.selectionStart || 0;
    form.value.slug = processed;
    // Restore cursor position after the change
    nextTick(() => {
      target.setSelectionRange(cursorPos, cursorPos);
    });
  }
}

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
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

async function savePost() {
  if (!form.value.title) return alert('Please enter a title');
  
  // Ensure slug is properly formatted before saving (trim trailing dashes)
  if (form.value.slug) {
    form.value.slug = slugify(form.value.slug);
  }
  
  loading.value = true;
  try {
    const endpoint = isEditing.value ? `/api/news/${route.params.slug}` : '/api/news';
    const method = isEditing.value ? 'PUT' : 'POST';

    await $fetch(endpoint, {
      method,
      body: form.value
    });
    router.push('/admin');
  } catch (e: any) {
    if (e.response && e.response.status === 409) {
      alert('A post with this URL slug already exists. Please change the title or the slug.');
    } else {
      alert(`Failed to ${isEditing.value ? 'update' : 'create'} post`);
      console.error(e);
    }
  } finally {
    loading.value = false;
  }
}
</script>
