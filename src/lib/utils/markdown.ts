import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  breaks: true
});

export function renderMarkdown(markdown: string) {
  if (!markdown) return '';
  return md.render(markdown);
}
