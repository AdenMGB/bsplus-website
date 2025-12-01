<template>
  <div class="tiptap-editor border border-zinc-700 rounded-lg overflow-hidden bg-zinc-900 h-full flex flex-col">
    <div v-if="editor" class="menu-bar flex flex-wrap gap-1 p-2 border-b border-zinc-700 bg-zinc-800 sticky top-0 z-10">
      <button @click="editor.chain().focus().toggleBold().run()" :class="{ 'is-active': editor.isActive('bold') }" class="editor-btn" title="Bold">
        <span class="font-bold">B</span>
      </button>
      <button @click="editor.chain().focus().toggleItalic().run()" :class="{ 'is-active': editor.isActive('italic') }" class="editor-btn" title="Italic">
        <span class="italic">I</span>
      </button>
      <button @click="editor.chain().focus().toggleUnderline().run()" :class="{ 'is-active': editor.isActive('underline') }" class="editor-btn" title="Underline">
        <span class="underline">U</span>
      </button>
      <button @click="editor.chain().focus().toggleStrike().run()" :class="{ 'is-active': editor.isActive('strike') }" class="editor-btn" title="Strikethrough">
        <span class="line-through">S</span>
      </button>
      
      <div class="w-px h-6 bg-zinc-600 mx-1 self-center"></div>

      <button @click="editor.chain().focus().setTextAlign('left').run()" :class="{ 'is-active': editor.isActive({ textAlign: 'left' }) }" class="editor-btn" title="Align Left">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
        </svg>
      </button>
      <button @click="editor.chain().focus().setTextAlign('center').run()" :class="{ 'is-active': editor.isActive({ textAlign: 'center' }) }" class="editor-btn" title="Align Center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      <button @click="editor.chain().focus().setTextAlign('right').run()" :class="{ 'is-active': editor.isActive({ textAlign: 'right' }) }" class="editor-btn" title="Align Right">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      
      <div class="w-px h-6 bg-zinc-600 mx-1 self-center"></div>
      
      <button @click="editor.chain().focus().setParagraph().run()" :class="{ 'is-active': editor.isActive('paragraph') }" class="editor-btn" title="Paragraph">
        P
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 1 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 1 }) }" class="editor-btn" title="Heading 1">
        H1
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 2 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 2 }) }" class="editor-btn" title="Heading 2">
        H2
      </button>
      <button @click="editor.chain().focus().toggleHeading({ level: 3 }).run()" :class="{ 'is-active': editor.isActive('heading', { level: 3 }) }" class="editor-btn" title="Heading 3">
        H3
      </button>
      
      <div class="w-px h-6 bg-zinc-600 mx-1 self-center"></div>
      
      <button @click="editor.chain().focus().toggleBulletList().run()" :class="{ 'is-active': editor.isActive('bulletList') }" class="editor-btn" title="Bullet List">
        • List
      </button>
      <button @click="editor.chain().focus().toggleOrderedList().run()" :class="{ 'is-active': editor.isActive('orderedList') }" class="editor-btn" title="Ordered List">
        1. List
      </button>
      <button @click="editor.chain().focus().toggleBlockquote().run()" :class="{ 'is-active': editor.isActive('blockquote') }" class="editor-btn" title="Quote">
        ""
      </button>
      
      <div class="w-px h-6 bg-zinc-600 mx-1 self-center"></div>
      
      <button @click="editor.chain().focus().setHorizontalRule().run()" class="editor-btn" title="Horizontal Rule">
        ---
      </button>
      
      <div class="w-px h-6 bg-zinc-600 mx-1 self-center"></div>
      
      <button @click="toggleCodeBlock" :class="{ 'is-active': editor.isActive('codeBlock') }" class="editor-btn flex items-center gap-1" title="Code Block">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
        </svg>
        <span>Code</span>
      </button>
      <button v-if="editor?.isActive('codeBlock')" @click="setCodeBlockLanguage" class="editor-btn flex items-center gap-1" title="Set Language">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 10.5h18M3 3h18" />
        </svg>
        <span>Lang</span>
      </button>
      
      <div class="flex-grow"></div>
      
      <button @click="addImage" class="editor-btn flex items-center gap-1">
        <span>Link Img</span>
      </button>
      <label class="editor-btn cursor-pointer flex items-center gap-1">
        <input type="file" class="hidden" accept="image/*" @change="handleImageUpload" />
        <span>Upload Img</span>
      </label>
    </div>
    
    <div class="flex-1 overflow-y-auto bg-zinc-900/50 cursor-text" @click="focusEditor">
      <editor-content v-if="editor" :editor="editor" class="p-8 prose prose-invert prose-lg max-w-none focus:outline-none min-h-full" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useEditor, EditorContent, VueNodeViewRenderer } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import CodeBlock from '@tiptap/extension-code-block'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import TiptapImage from './TiptapImage.vue'

const CustomImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        renderHTML: (attributes) => {
          if (!attributes.width) {
            return {}
          }
          return {
            width: attributes.width,
            style: `width: ${attributes.width}px`,
          }
        },
      },
    }
  },
  addNodeView() {
    return VueNodeViewRenderer(TiptapImage)
  },
})


const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
})

const emit = defineEmits(['update:modelValue'])

const editor = useEditor({
  content: props.modelValue,
  extensions: [
    StarterKit.configure({
      codeBlock: false, // Disable default codeBlock from StarterKit
    }),
    CodeBlock.configure({
      languageClassPrefix: 'language-',
      HTMLAttributes: {
        class: 'code-block',
      },
    }),
    CustomImage,
    Link.configure({
      openOnClick: false,
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
  ],
  editorProps: {
    attributes: {
      class: 'focus:outline-none h-full',
    },
  },
  onUpdate: ({ editor }) => {
    emit('update:modelValue', editor.getHTML())
  },
})

watch(() => props.modelValue, (value) => {
  const isSame = editor.value?.getHTML() === value
  if (isSame) {
    return
  }
  editor.value?.commands.setContent(value, { emitUpdate: false })
})

const focusEditor = () => {
  editor.value?.chain().focus().run()
}

const addImage = () => {
  const url = window.prompt('URL')

  if (url) {
    editor.value?.chain().focus().setImage({ src: url }).run()
  }
}

const toggleCodeBlock = () => {
  if (editor.value?.isActive('codeBlock')) {
    // If already a code block, just toggle it off
    editor.value?.chain().focus().toggleCodeBlock().run()
  } else {
    // Prompt for language when creating new code block
    const language = window.prompt('Language (e.g., typescript, javascript, python, rust, vue, svelte):', '')
    if (language !== null) {
      // Create code block and set language in one chain
      const chain = editor.value?.chain().focus().setCodeBlock()
      if (language.trim()) {
        chain.updateAttributes('codeBlock', { language: language.trim() })
      }
      chain.run()
    }
  }
}

const setCodeBlockLanguage = () => {
  if (!editor.value?.isActive('codeBlock')) return
  
  // Get current language from the code block
  const currentAttrs = editor.value.getAttributes('codeBlock')
  const currentLanguage = currentAttrs.language || ''
  
  const language = window.prompt('Set language (e.g., typescript, javascript, python, rust, vue, svelte):', currentLanguage)
  
  if (language !== null) {
    editor.value?.chain().focus().updateAttributes('codeBlock', { 
      language: language.trim() || null 
    }).run()
  }
}


const handleImageUpload = async (event: Event) => {
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
      editor.value?.chain().focus().setImage({ src: response.url }).run();
    }
  } catch (error) {
    console.error('Image upload failed', error);
    alert('Failed to upload image');
  } finally {
    input.value = ''; // Reset input
  }
}

onBeforeUnmount(() => {
  editor.value?.destroy()
})
</script>

<style scoped>
.editor-btn {
  @apply px-3 py-1.5 rounded text-sm font-medium text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all flex items-center justify-center min-w-[32px];
}

.editor-btn.is-active {
  @apply bg-zinc-600 text-white shadow-sm;
}

/* Tiptap Custom Styles for WYSIWYG feel */
:deep(.ProseMirror) {
  min-height: 100%;
  outline: none;
}
:deep(.ProseMirror ul) {
  list-style-type: disc;
  padding-left: 1.5em;
}
:deep(.ProseMirror ol) {
  list-style-type: decimal;
  padding-left: 1.5em;
}
:deep(.ProseMirror blockquote) {
  border-left: 4px solid #4b5563;
  padding-left: 1rem;
  font-style: italic;
  @apply text-zinc-400 my-4;
}
:deep(.ProseMirror hr) {
  @apply border-zinc-700 my-4;
}
:deep(.ProseMirror h1) {
  @apply text-3xl font-bold text-white mb-4 mt-6;
}
:deep(.ProseMirror h2) {
  @apply text-2xl font-bold text-white mb-3 mt-5;
}
:deep(.ProseMirror h3) {
  @apply text-xl font-bold text-white mb-2 mt-4;
}
:deep(.ProseMirror p) {
  @apply mb-4 leading-relaxed text-zinc-300;
}
:deep(.ProseMirror a) {
  @apply text-green-400 underline decoration-green-400/30 hover:decoration-green-400 transition-all;
}
:deep(.ProseMirror img) {
  @apply rounded-lg border border-zinc-700 shadow-lg my-6 max-w-full h-auto;
}

/* Code Block Styles - Override prose styles */
:deep(.ProseMirror pre) {
  background-color: rgb(9 9 11) !important; /* bg-zinc-950 */
  border: 1px solid rgb(63 63 70) !important; /* border-zinc-700 */
  border-radius: 0.5rem !important;
  overflow-x: auto !important;
  margin-top: 1.5rem !important;
  margin-bottom: 1.5rem !important;
  padding: 1rem !important;
  position: relative;
  color: rgb(244 244 245) !important; /* text-zinc-100 */
}

:deep(.ProseMirror pre code) {
  font-size: 0.875rem !important;
  color: rgb(244 244 245) !important; /* text-zinc-100 */
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace !important;
  white-space: pre !important;
  line-height: 1.6 !important;
  display: block !important;
  width: 100% !important;
  background: transparent !important;
  padding: 0 !important;
  margin: 0 !important;
  border: none !important;
  border-radius: 0 !important;
}

/* Ensure code blocks with class are properly styled */
:deep(.ProseMirror pre.code-block) {
  background-color: rgb(9 9 11) !important;
  border: 1px solid rgb(63 63 70) !important;
  border-radius: 0.5rem !important;
  overflow-x: auto !important;
  margin-top: 1.5rem !important;
  margin-bottom: 1.5rem !important;
  padding: 1rem !important;
}
</style>

