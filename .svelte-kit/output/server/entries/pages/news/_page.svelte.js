import { C as attr, T as escape_html, a as ensure_array_like, d as html, i as derived } from "../../../chunks/server.js";
import { t as Card } from "../../../chunks/Card.js";
//#region src/routes/news/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const posts = derived(() => data.posts ?? []);
		const formatDate = (timestamp) => (/* @__PURE__ */ new Date(timestamp * 1e3)).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric"
		});
		$$renderer.push(`<section class="space-y-10 pb-12 pt-6 md:pt-10"><div class="hero-panel px-6 py-8 md:px-8 md:py-10"><div class="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end"><div class="space-y-4"><div class="eyebrow-badge">News and updates</div> <h1 class="section-title max-w-4xl">Latest updates from the BetterSEQTA team.</h1> <p class="hero-kicker">Follow releases, announcements, and ecosystem improvements across BetterSEQTA+ and DesQTA in a cleaner editorial layout.</p></div> <div class="metric-card"><div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Articles available</div> <div class="mt-3 text-2xl font-semibold text-white">${escape_html(posts().length)}</div> <div class="mt-1 text-sm text-muted">Project news, changelogs, launches, and release highlights.</div></div></div></div> <div class="grid gap-6 lg:grid-cols-3"><!--[-->`);
		const each_array = ensure_array_like(posts());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let post = each_array[$$index];
			$$renderer.push(`<a class="block"${attr("href", `/news/${post.slug}`)}>`);
			Card($$renderer, {
				className: "flex h-full flex-col overflow-hidden p-0",
				children: ($$renderer) => {
					if (post.cover_image) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="relative h-56 overflow-hidden"><img${attr("alt", post.title)} class="h-full w-full object-cover transition-transform duration-200 hover:scale-105"${attr("src", post.cover_image)}/> <div class="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/45 to-transparent"></div></div>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> <div class="flex flex-1 flex-col gap-4 p-6 md:p-7"><div class="section-subtitle">Article</div> <div class="text-sm text-soft">${escape_html(formatDate(post.created_at))}</div> <h2 class="text-2xl font-semibold tracking-tight text-white">${escape_html(post.title)}</h2> <div class="line-clamp-4 text-sm leading-7 text-muted">${html(post.content)}</div> <div class="mt-auto flex items-center gap-3 border-t border-white/8 pt-4"><img${attr("alt", post.author_name)} class="h-10 w-10 rounded-full border border-white/10 object-cover"${attr("src", post.author_avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.author_name)}`)}/> <div><div class="font-medium text-white">${escape_html(post.author_name)}</div> <div class="text-sm text-soft">Read more</div></div></div></div>`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></a>`);
		}
		$$renderer.push(`<!--]--></div></section>`);
	});
}
//#endregion
export { _page as default };
