import MarkdownIt from "markdown-it";
//#region src/lib/utils/markdown.ts
var md = new MarkdownIt({
	html: true,
	linkify: true,
	typographer: true,
	breaks: true
});
function renderMarkdown(markdown) {
	if (!markdown) return "";
	return md.render(markdown);
}
//#endregion
export { renderMarkdown as t };
