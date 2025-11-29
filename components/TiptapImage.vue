<template>
  <node-view-wrapper class="tiptap-image-view" :class="{ 'is-selected': selected }">
    <div class="image-container" :style="{ width: typeof node.attrs.width === 'number' ? node.attrs.width + 'px' : node.attrs.width }">
      <img
        :src="node.attrs.src"
        :alt="node.attrs.alt"
        :title="node.attrs.title"
        class="rounded-lg border border-zinc-700 shadow-lg"
      />
      <div
        v-if="editor.isEditable"
        class="resize-handle"
        @mousedown="onMouseDown"
      ></div>
    </div>
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3'

const props = defineProps(nodeViewProps)

const onMouseDown = (event: MouseEvent) => {
  event.preventDefault()
  const startX = event.pageX
  const startWidth = (event.target as HTMLElement).parentElement?.offsetWidth || 0

  const onMouseMove = (moveEvent: MouseEvent) => {
    const currentX = moveEvent.pageX
    const diffX = currentX - startX
    const newWidth = Math.max(100, startWidth + diffX) // Minimum 100px

    props.updateAttributes({
      width: newWidth,
    })
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}
</script>

<style scoped>
.tiptap-image-view {
  display: inline-block;
  line-height: 0;
  position: relative;
  max-width: 100%;
}

.image-container {
  position: relative;
  display: inline-block;
  max-width: 100%;
}

.image-container img {
  width: 100%;
  height: auto;
  display: block;
}

.resize-handle {
  position: absolute;
  right: -6px;
  bottom: -6px;
  width: 12px;
  height: 12px;
  background-color: #3b82f6; /* blue-500 */
  border: 2px solid white;
  border-radius: 50%;
  cursor: nwse-resize;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 10;
}

.tiptap-image-view:hover .resize-handle,
.tiptap-image-view.is-selected .resize-handle {
  opacity: 1;
}

.tiptap-image-view.is-selected img {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>

