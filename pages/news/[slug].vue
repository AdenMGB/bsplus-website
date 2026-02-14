<template>
  <div class="py-16 sm:py-24 lg:py-32">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="mx-auto max-w-5xl">
        <div class="mb-6 sm:mb-8">
          <NuxtLink to="/news" class="text-sm font-semibold leading-6 text-zinc-400 hover:text-white">&larr; Back to News</NuxtLink>
        </div>
        
        <article v-if="post">
           <!-- Cover Image Banner -->
           <div v-if="post.cover_image" class="w-full h-[200px] sm:h-[300px] lg:h-[400px] rounded-2xl overflow-hidden mb-6 sm:mb-8 relative border border-zinc-800 -mx-4 sm:mx-0">
              <img :src="post.cover_image" :alt="post.title" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-transparent"></div>
           </div>

           <div class="flex items-center gap-x-4 text-xs mb-3 sm:mb-4">
            <time :datetime="formatDate(post.created_at)" class="text-zinc-400">{{ formatDate(post.created_at) }}</time>
          </div>
          <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white mb-6 sm:mb-8">{{ post.title }}</h1>
          
          <div class="flex items-center gap-x-3 sm:gap-x-4 mb-6 sm:mb-8 border-b border-zinc-700 pb-6 sm:pb-8">
             <img :src="(post as any).author_avatar || `https://ui-avatars.com/api/?name=${(post as any).author_name}`" alt="" class="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-zinc-800" />
            <div class="text-xs sm:text-sm leading-6">
              <p class="font-semibold text-white">{{ (post as any).author_name }}</p>
            </div>
          </div>

          <div ref="contentRef" class="prose prose-sm sm:prose-base lg:prose-lg prose-invert max-w-none text-zinc-300 prose-pre:overflow-x-auto prose-code:text-xs sm:prose-code:text-sm" v-html="post.content"></div>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const route = useRoute();
const { data: post } = await useFetch<any>(`/api/news/${route.params.slug}`, {
  query: {
    preview: route.query.preview
  }
});
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

function stripHtml(html: string, maxLength = 155): string {
  const text = html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
  return text.length > maxLength ? text.slice(0, maxLength - 3) + '...' : text;
}

const p = post.value!;
const description = p.content ? stripHtml(p.content) : `${p.title} - News from BetterSEQTA+`;
const config = useRuntimeConfig();
const baseUrl = (config.public?.siteUrl ?? 'https://betterseqta.org').replace(/\/$/, '');

usePageSeo({
  title: p.title,
  description,
  image: (p as any).cover_image || '/favicon-96x96.png',
  canonical: `${baseUrl}/news/${route.params.slug}`,
});

useSeoMeta({
  articlePublishedTime: new Date(p.created_at * 1000).toISOString(),
  articleAuthor: (p as any).author_name,
  articleSection: 'News',
});

const schemaHelpers = useSchemaOrgHelpers();
useSchemaOrg([
  schemaHelpers.article({
    headline: p.title,
    description,
    image: (p as any).cover_image,
    datePublished: p.created_at,
    dateModified: (p as any).updated_at ?? p.created_at,
    author: (p as any).author_name ? [{ name: (p as any).author_name }] : undefined,
    url: `${baseUrl}/news/${route.params.slug}`,
  }),
]);
</script>

