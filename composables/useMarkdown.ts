import MarkdownIt from 'markdown-it';

let md: MarkdownIt | null = null;

export const useMarkdown = () => {
  if (!md) {
    md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
      breaks: true
    });
  }

  const render = (markdown: string): string => {
    if (!markdown) return '';
    return md!.render(markdown);
  };

  return { render };
};
