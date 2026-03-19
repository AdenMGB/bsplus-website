import { T as escape_html, a as ensure_array_like, t as attr_class } from "../../../chunks/server.js";
import { t as Card } from "../../../chunks/Card.js";
import { t as comparisonRows } from "../../../chunks/site.js";
//#region src/routes/comparison/+page.svelte
function _page($$renderer) {
	const renderValue = (value) => {
		if (value === true) return "Yes";
		if (value === "partial") return "Partial";
		return "No";
	};
	const tone = (value) => {
		if (value === true) return "text-emerald-300";
		if (value === "partial") return "text-amber-300";
		return "text-slate-400";
	};
	$$renderer.push(`<section class="space-y-10 pb-14 pt-6"><div class="max-w-4xl space-y-4"><div class="section-subtitle">Compare editions</div> <h1 class="section-title">Choose the BetterSEQTA setup that matches how you study.</h1> <p class="text-lg text-muted">BetterSEQTA+ is the quick browser upgrade. DesQTA is the full desktop experience. Both are built
      to be a clear step up from stock SEQTA Learn.</p></div> <div class="grid gap-6 lg:grid-cols-2">`);
	Card($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h2 class="text-2xl font-semibold text-white">Vanilla SEQTA</h2> <ul class="mt-4 space-y-3 text-muted"><li>Basic interface and fixed layout</li> <li>Limited customization</li> <li>No polished dark mode</li> <li>No live wallpapers or enhanced organization</li></ul>`);
		},
		$$slots: { default: true }
	});
	$$renderer.push(`<!----> `);
	Card($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h2 class="text-2xl font-semibold text-white">BetterSEQTA ecosystem</h2> <ul class="mt-4 space-y-3 text-muted"><li>Beautiful themes and dark surfaces</li> <li>Live wallpapers and custom styling</li> <li>Desktop-native workflow through DesQTA</li> <li>Ongoing feature development for admin and student tools</li></ul>`);
		},
		$$slots: { default: true }
	});
	$$renderer.push(`<!----></div> `);
	Card($$renderer, {
		className: "overflow-hidden p-0",
		children: ($$renderer) => {
			$$renderer.push(`<div class="overflow-x-auto"><table class="surface-table"><thead><tr><th>Feature</th><th class="text-center">BetterSEQTA+</th><th class="text-center">DesQTA</th><th class="text-center">Vanilla SEQTA</th></tr></thead><tbody><!--[-->`);
			const each_array = ensure_array_like(comparisonRows);
			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let row = each_array[$$index];
				$$renderer.push(`<tr><td class="font-medium text-white">${escape_html(row[0])}</td><td${attr_class(`text-center ${tone(row[1])}`)}>${escape_html(renderValue(row[1]))}</td><td${attr_class(`text-center ${tone(row[2])}`)}>${escape_html(renderValue(row[2]))}</td><td${attr_class(`text-center ${tone(row[3])}`)}>${escape_html(renderValue(row[3]))}</td></tr>`);
			}
			$$renderer.push(`<!--]--></tbody></table></div>`);
		},
		$$slots: { default: true }
	});
	$$renderer.push(`<!----></section>`);
}
//#endregion
export { _page as default };
