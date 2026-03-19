import { C as attr, T as escape_html, a as ensure_array_like, d as html, i as derived } from "../../../../chunks/server.js";
import { t as Card } from "../../../../chunks/Card.js";
//#region src/routes/changelogs/bqplus/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const releases = derived(() => data.releases ?? []);
		let expanded = /* @__PURE__ */ new Set();
		const formatVersion = (tag) => tag.replace("betterseqtaplus@", "v");
		const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric"
		});
		$$renderer.push(`<section class="mx-auto max-w-5xl space-y-8 pb-14 pt-6"><a class="nav-link text-sm" href="/changelogs">← Back to Changelogs</a> <div class="space-y-3"><div class="section-subtitle">BetterSEQTA+ changelog</div> <h1 class="section-title">Complete release history for the browser extension.</h1></div> <div class="space-y-4"><!--[-->`);
		const each_array = ensure_array_like(releases());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let release = each_array[$$index];
			Card($$renderer, {
				className: "overflow-hidden p-0",
				children: ($$renderer) => {
					$$renderer.push(`<button class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left" type="button"><div><div class="text-xl font-semibold text-white">${escape_html(release.name || formatVersion(release.tag_name))}</div> <div class="mt-2 text-sm text-soft">${escape_html(formatVersion(release.tag_name))} · ${escape_html(formatDate(release.published_at))} · ${escape_html(release.author)}</div></div> <div class="text-sm text-soft">${escape_html(expanded.has(release.id) ? "Hide" : "Show")}</div></button> `);
					if (expanded.has(release.id)) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="border-t border-white/8 px-6 py-5"><div class="prose-theme max-w-none text-sm">${html(release.renderedBody)}</div> <div class="mt-5"><a class="nav-link text-sm"${attr("href", release.html_url)} rel="noreferrer" target="_blank">View on GitHub</a></div></div>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});
		}
		$$renderer.push(`<!--]--></div></section>`);
	});
}
//#endregion
export { _page as default };
