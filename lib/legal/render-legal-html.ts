import MarkdownIt from 'markdown-it';

const md = new MarkdownIt({ html: false, linkify: true });

export function renderLegalMarkdown(markdown: string): string {
  return md.render(markdown.trim());
}

export function wrapWhatsNewHtml(innerHtml: string): string {
  return `<div class="whatsnewTextContainer">${innerHtml}</div>`;
}

export function renderLegalHtmlForApi(markdown: string): string {
  return wrapWhatsNewHtml(renderLegalMarkdown(markdown));
}
