import { C as attr, T as escape_html } from "../../../../../chunks/server.js";
import { t as Card } from "../../../../../chunks/Card.js";
//#region src/routes/admin/themes/upload/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let submitting = false;
		$$renderer.push(`<section class="space-y-8"><div class="space-y-3"><div class="section-subtitle">Theme upload</div> <h1 class="text-4xl font-semibold text-white">Upload a marketplace theme</h1></div> <div class="grid gap-6 xl:grid-cols-2">`);
		Card($$renderer, {
			className: "space-y-5",
			children: ($$renderer) => {
				$$renderer.push(`<h2 class="text-2xl font-semibold text-white">Publish to marketplace</h2> <form class="space-y-4"><input class="input-surface" name="theme_zip" type="file" required=""/> <button class="btn-accent" type="submit"${attr("disabled", submitting, true)}>${escape_html("Upload theme")}</button></form>`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----> `);
		Card($$renderer, {
			className: "space-y-5",
			children: ($$renderer) => {
				$$renderer.push(`<h2 class="text-2xl font-semibold text-white">Preview manifest</h2> <form class="space-y-4"><input class="input-surface" name="theme_zip" type="file" required=""/> <button class="btn-ghost" type="submit">Preview validation</button></form>`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
export { _page as default };
