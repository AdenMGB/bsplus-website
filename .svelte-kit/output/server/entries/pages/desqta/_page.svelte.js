import { T as escape_html, a as ensure_array_like } from "../../../chunks/server.js";
import { t as Button } from "../../../chunks/Button.js";
import { t as Card } from "../../../chunks/Card.js";
//#region src/routes/desqta/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		$$renderer.push(`<section class="space-y-10 pb-14 pt-6"><div class="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">`);
		Card($$renderer, {
			className: "space-y-6 p-8 md:p-10 lg:p-12",
			children: ($$renderer) => {
				$$renderer.push(`<div class="section-subtitle">Desktop app</div> <h1 class="section-title">DesQTA turns SEQTA Learn into a real desktop workspace.</h1> <p class="text-lg leading-8 text-muted">Move beyond the browser with offline support, faster navigation, native notifications, and room
        for bigger BetterSEQTA Cloud features.</p> <div class="flex flex-wrap gap-3">`);
				Button($$renderer, {
					href: "/download",
					children: ($$renderer) => {
						$$renderer.push(`<!---->Download DesQTA`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----> `);
				Button($$renderer, {
					href: "/comparison",
					variant: "ghost",
					children: ($$renderer) => {
						$$renderer.push(`<!---->Compare features`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----> `);
		Card($$renderer, {
			className: "space-y-4 p-8",
			children: ($$renderer) => {
				$$renderer.push(`<div class="text-sm font-semibold uppercase tracking-[0.16em] text-soft">Latest release</div> <div class="text-3xl font-semibold text-white">${escape_html(data.release?.tag_name ?? "Available now")}</div> <p class="text-muted">Windows, macOS, and Android packages are distributed from the DesQTA release pipeline, with Linux support planned.</p> <div class="stat-grid"><div class="glass-card p-4"><div class="text-sm text-soft">Windows</div> <div class="mt-2 font-semibold text-white">Supported</div></div> <div class="glass-card p-4"><div class="text-sm text-soft">macOS</div> <div class="mt-2 font-semibold text-white">Supported</div></div> <div class="glass-card p-4"><div class="text-sm text-soft">Android</div> <div class="mt-2 font-semibold text-white">Supported</div></div></div>`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></div> <div class="space-y-5"><div class="max-w-3xl space-y-3"><div class="section-subtitle">Why DesQTA</div> <h2 class="text-3xl font-semibold text-white md:text-5xl">A bigger, wider interface for the full BetterSEQTA vision.</h2> <p class="text-lg text-muted">DesQTA has room for productivity features that do not fit comfortably inside a browser extension.</p></div> <div class="grid gap-6 md:grid-cols-2 xl:grid-cols-3"><!--[-->`);
		const each_array = ensure_array_like(data.features);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let feature = each_array[$$index];
			Card($$renderer, {
				className: "space-y-4",
				children: ($$renderer) => {
					$$renderer.push(`<h3 class="text-xl font-semibold text-white">${escape_html(feature.title)}</h3> <p class="text-muted">${escape_html(feature.description)}</p>`);
				},
				$$slots: { default: true }
			});
		}
		$$renderer.push(`<!--]--></div></div></section>`);
	});
}
//#endregion
export { _page as default };
