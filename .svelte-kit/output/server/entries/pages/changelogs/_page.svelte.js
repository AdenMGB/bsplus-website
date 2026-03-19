import { T as escape_html, d as html } from "../../../chunks/server.js";
import { t as Button } from "../../../chunks/Button.js";
import { t as Card } from "../../../chunks/Card.js";
//#region src/routes/changelogs/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric"
		});
		const formatVersion = (tag) => tag.replace("betterseqtaplus@", "v");
		$$renderer.push(`<section class="space-y-10 pb-14 pt-6"><div class="max-w-4xl space-y-4"><div class="section-subtitle">Release notes</div> <h1 class="section-title">Keep up with the latest BetterSEQTA and DesQTA releases.</h1> <p class="text-lg text-muted">We publish change summaries for the browser extension and the desktop app as soon as new versions land.</p></div> <div class="grid gap-6 lg:grid-cols-2">`);
		Card($$renderer, {
			className: "space-y-5",
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex items-center justify-between gap-4"><div><div class="section-subtitle">BetterSEQTA+</div> <h2 class="mt-2 text-2xl font-semibold text-white">${escape_html(data.bqplusRelease ? formatVersion(data.bqplusRelease.tag_name) : "No release yet")}</h2> `);
				if (data.bqplusRelease?.published_at) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="mt-2 text-sm text-soft">${escape_html(formatDate(data.bqplusRelease.published_at))}</div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> `);
				Button($$renderer, {
					href: "/changelogs/bqplus",
					variant: "ghost",
					children: ($$renderer) => {
						$$renderer.push(`<!---->View history`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div> <div class="prose-theme line-clamp-6 max-w-none text-sm">${html(data.renderedBqplus)}</div>`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----> `);
		Card($$renderer, {
			className: "space-y-5",
			children: ($$renderer) => {
				$$renderer.push(`<div class="flex items-center justify-between gap-4"><div><div class="section-subtitle">DesQTA</div> <h2 class="mt-2 text-2xl font-semibold text-white">${escape_html(data.desqtaRelease?.tag_name ?? "No release yet")}</h2> `);
				if (data.desqtaRelease?.published_at) {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<div class="mt-2 text-sm text-soft">${escape_html(formatDate(data.desqtaRelease.published_at))}</div>`);
				} else $$renderer.push("<!--[-1-->");
				$$renderer.push(`<!--]--></div> `);
				Button($$renderer, {
					href: "/changelogs/desqta",
					variant: "ghost",
					children: ($$renderer) => {
						$$renderer.push(`<!---->View history`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div> <div class="prose-theme line-clamp-6 max-w-none text-sm">${html(data.renderedDesqta)}</div>`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></div></section>`);
	});
}
//#endregion
export { _page as default };
