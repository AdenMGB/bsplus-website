<template>
  <div class="py-24 sm:py-32">
    <div class="mx-auto max-w-7xl px-6 lg:px-8">
      <div class="mx-auto max-w-5xl">
        <div class="mb-8">
          <NuxtLink to="/news" class="text-sm font-semibold leading-6 text-zinc-400 hover:text-white">&larr; Back to News</NuxtLink>
        </div>
        
        <article v-if="post">
           <div class="flex items-center gap-x-4 text-xs mb-4">
            <time :datetime="formatDate(post.created_at)" class="text-zinc-400">{{ formatDate(post.created_at) }}</time>
          </div>
          <h1 class="text-3xl font-bold tracking-tight text-white sm:text-4xl mb-8">{{ post.title }}</h1>
          
          <div class="flex items-center gap-x-4 mb-8 border-b border-zinc-700 pb-8">
             <img :src="(post as any).author_avatar || `https://ui-avatars.com/api/?name=${(post as any).author_name}`" alt="" class="h-10 w-10 rounded-full bg-zinc-800" />
            <div class="text-sm leading-6">
              <p class="font-semibold text-white">{{ (post as any).author_name }}</p>
            </div>
          </div>

          <div ref="contentRef" class="prose prose-invert prose-lg max-w-none text-zinc-300" v-html="post.content"></div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const route = useRoute();
const { data: post } = await useFetch<any>(`/api/news/${route.params.slug}`);
const contentRef = ref<HTMLElement | null>(null)

if (!post.value) {
  throw createError({ statusCode: 404, message: 'Post not found' });
}

// Mapping of language names to devicon icon names
const languageIconMap: Record<string, string> = {
  'svelte': 'svelte',
  'typescript': 'typescript',
  'javascript': 'javascript',
  'rust': 'rust',
  'vue': 'vuejs',
  'python': 'python',
  'java': 'java',
  'cpp': 'cplusplus',
  'c': 'c',
  'go': 'go',
  'php': 'php',
  'ruby': 'ruby',
  'swift': 'swift',
  'kotlin': 'kotlin',
  'html': 'html5',
  'css': 'css3',
  'scss': 'sass',
  'json': 'json',
  'yaml': 'yaml',
  'xml': 'xml',
  'sql': 'mysql',
  'bash': 'bash',
  'shell': 'bash',
  'cmd': 'windows',
  'powershell': 'powershell',
  'dockerfile': 'docker',
  'markdown': 'markdown',
  'git': 'git',
  'node': 'nodejs',
  'react': 'react',
  'angular': 'angularjs',
  'next': 'nextjs',
  'nuxt': 'nuxtjs',
  'tailwind': 'tailwindcss',
  'bootstrap': 'bootstrap',
  'jquery': 'jquery',
  'mongodb': 'mongodb',
  'postgresql': 'postgresql',
  'redis': 'redis',
  'nginx': 'nginx',
  'apache': 'apache',
  'linux': 'linux',
  'ubuntu': 'ubuntu',
  'debian': 'debian',
  'fedora': 'fedora',
  'redhat': 'redhat',
  'centos': 'centos',
}

function getLanguageIconUrl(language: string): string {
  if (!language) return ''
  const lang = language.toLowerCase()
  const iconName = languageIconMap[lang]
  if (!iconName) return ''
  return `https://cdn.jsdelivr.net/gh/devicons/devicon/icons/${iconName}/${iconName}-original.svg`
}

function processCodeBlocks() {
  if (!contentRef.value) return
  
  const codeBlocks = contentRef.value.querySelectorAll('pre code')
  codeBlocks.forEach((codeElement) => {
    const preElement = codeElement.parentElement
    if (!preElement || preElement.tagName !== 'PRE') return
    
    // Extract language from class (e.g., "language-typescript" -> "typescript")
    const classes = codeElement.className
    const languageMatch = classes.match(/language-(\w+)/)
    const language = languageMatch ? languageMatch[1] : ''
    
    // Skip if already processed
    if (preElement.classList.contains('code-block-processed')) return
    preElement.classList.add('code-block-processed')
    
    const iconUrl = getLanguageIconUrl(language)
    const iconHtml = iconUrl ? `<img src="${iconUrl}" alt="${language}" class="w-5 h-5" />` : ''
    
    // Wrap the pre element with header
    const wrapper = document.createElement('div')
    wrapper.className = 'code-block-wrapper'
    wrapper.innerHTML = `
      <div class="code-block-header flex items-center justify-between bg-zinc-800 border border-zinc-700 border-b-0 rounded-t-lg px-4 py-2">
        <div class="flex items-center gap-2">
          ${iconHtml}
          <span class="text-sm font-medium text-zinc-300">${language || 'Code'}</span>
        </div>
        <div class="flex items-center gap-2">
          ${language ? `<span class="text-xs text-zinc-500 uppercase">${language}</span>` : ''}
        </div>
      </div>
    `
    
    // Clone and wrap the pre element
    const preClone = preElement.cloneNode(true) as HTMLElement
    preClone.className = 'code-block-content bg-zinc-950 border border-zinc-700 rounded-b-lg overflow-x-auto'
    // Remove all margins and ensure proper padding
    preClone.style.margin = '0'
    preClone.style.marginTop = '0'
    preClone.style.marginBottom = '0'
    preClone.style.padding = '1rem'
    // Ensure code element inside has no extra spacing
    const clonedCodeElement = preClone.querySelector('code')
    if (clonedCodeElement) {
      clonedCodeElement.style.margin = '0'
      clonedCodeElement.style.padding = '0'
    }
    wrapper.appendChild(preClone)
    
    // Replace original pre with wrapper
    preElement.parentNode?.replaceChild(wrapper, preElement)
  })
}

function escapeHtml(text: string) {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

watch(() => post.value?.content, () => {
  if (post.value?.content) {
    setTimeout(processCodeBlocks, 0)
  }
})

onMounted(() => {
  setTimeout(processCodeBlocks, 0)
})

function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

useHead({
  title: post.value?.title || 'News Post',
});
</script>

