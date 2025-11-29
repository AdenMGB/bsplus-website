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
    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8">
      <!-- Cover Image Input -->
      <div class="space-y-4">
        <label class="block text-sm font-medium text-zinc-400">Cover Image</label>
        <div class="flex items-center gap-4">
          <div v-if="form.cover_image" class="relative group h-32 w-48 rounded-lg overflow-hidden border border-zinc-700">
            <img :src="form.cover_image" class="h-full w-full object-cover" />
            <div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <button @click="form.cover_image = ''" class="text-white hover:text-red-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-6 h-6">
                  <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                </svg>
              </button>
            </div>
          </div>
          <div v-else class="h-32 w-48 rounded-lg border-2 border-dashed border-zinc-700 flex items-center justify-center hover:border-zinc-500 hover:bg-zinc-900 transition-all cursor-pointer relative">
            <input type="file" accept="image/*" class="absolute inset-0 opacity-0 cursor-pointer" @change="handleCoverUpload" />
            <div class="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8 mx-auto text-zinc-500 mb-2">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <span class="text-xs text-zinc-500">Upload Cover</span>
            </div>
          </div>
        </div>
      </div>

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
            type="text" 
            class="bg-transparent border-0 text-sm text-zinc-400 focus:ring-0 p-0 w-full font-mono placeholder:text-zinc-700"
            placeholder="auto-generated-slug"
          />
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
      oldTitle = post.value.title;
    } else if (error.value) {
      alert('Failed to load post');
      router.push('/admin');
    }
  }
}

// Auto-generate slug from title (only if slug is empty or matches old auto-generated one)
watch(() => form.value.title, (newTitle) => {
  if (!isEditing.value && (!form.value.slug || form.value.slug === slugify(oldTitle))) {
    form.value.slug = slugify(newTitle);
  }
});

watch(() => form.value.title, (val) => oldTitle = val);

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

async function handleCoverUpload(event: Event) {
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
    input.value = ''; // Reset input
  }
}

async function savePost() {
  if (!form.value.title) return alert('Please enter a title');
  
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
