import "../../../chunks/index-server.js";
import { T as escape_html } from "../../../chunks/server.js";
import { t as Card } from "../../../chunks/Card.js";
import "../../../chunks/admin.js";
//#region src/routes/admin/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let dashboard = {
			stats: null,
			themes: null,
			collections: [],
			questions: [],
			news: []
		};
		$$renderer.push(`<section class="space-y-8 md:space-y-10"><div class="hero-panel px-6 py-7 md:px-8 md:py-8"><div class="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end"><div class="space-y-4"><div class="eyebrow-badge">Admin dashboard</div> <h1 class="text-4xl font-semibold tracking-tight text-white md:text-5xl">Overview</h1> <p class="max-w-3xl text-base leading-8 text-muted">Monitor usage, content, and marketplace activity from a single control surface with a cleaner dark admin shell.</p></div> <div class="grid gap-4 sm:grid-cols-2"><div class="metric-card"><div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">News coverage</div> <div class="mt-3 text-2xl font-semibold text-white">${escape_html(dashboard.stats?.news?.published ?? 0)}</div> <div class="mt-1 text-sm text-muted">Published announcements live on the site.</div></div> <div class="metric-card"><div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Theme queue</div> <div class="mt-3 text-2xl font-semibold text-white">${escape_html(dashboard.stats?.themes?.pending ?? 0)}</div> <div class="mt-1 text-sm text-muted">Submissions waiting for review.</div></div></div></div></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[0-->");
		Card($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Loading dashboard...`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
export { _page as default };
