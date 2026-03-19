import { C as attr, T as escape_html, d as html, i as derived } from "../../../../chunks/server.js";
//#region src/routes/news/[slug]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const post = derived(() => data.post);
		const formatDate = (timestamp) => (/* @__PURE__ */ new Date(timestamp * 1e3)).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric"
		});
		$$renderer.push(`<article class="mx-auto max-w-6xl space-y-8 pb-14 pt-6 md:pt-10"><a class="nav-link text-sm" href="/news">← Back to News</a> <div class="hero-panel overflow-hidden">`);
		if (post().cover_image) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<div class="relative h-72 overflow-hidden md:h-104"><img${attr("alt", post().title)} class="h-full w-full object-cover"${attr("src", post().cover_image)}/> <div class="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/45 to-transparent"></div></div>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> <div class="space-y-6 px-6 py-8 md:px-8 md:py-10"><div class="space-y-4"><div class="eyebrow-badge">News article</div> <div class="text-sm text-soft">${escape_html(formatDate(post().created_at))}</div> <h1 class="section-title max-w-5xl">${escape_html(post().title)}</h1></div> <div class="flex flex-wrap items-center gap-4 border-t border-white/8 pt-5"><img${attr("alt", post().author_name)} class="h-12 w-12 rounded-full border border-white/10 object-cover"${attr("src", post().author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post().author_name)}`)}/> <div><div class="font-medium text-white">${escape_html(post().author_name)}</div> <div class="text-sm text-soft">BetterSEQTA team</div></div></div></div></div> <div class="glass-card px-6 py-7 md:px-8 md:py-9"><div class="prose-theme max-w-none text-base leading-8">${html(post().content)}</div></div></article>`);
	});
}
//#endregion
export { _page as default };
