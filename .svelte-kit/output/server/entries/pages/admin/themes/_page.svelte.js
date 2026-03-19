import "../../../../chunks/index-server.js";
import "../../../../chunks/server.js";
import { t as Card } from "../../../../chunks/Card.js";
import "../../../../chunks/admin.js";
//#region src/routes/admin/themes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<section class="space-y-8"><div class="flex flex-wrap items-end justify-between gap-4"><div class="space-y-3"><div class="section-subtitle">Themes</div> <h1 class="text-4xl font-semibold text-white">Marketplace submissions</h1></div> <a class="btn-accent" href="/admin/themes/upload">Upload theme</a></div> `);
		$$renderer.push("<!--[1-->");
		Card($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Loading themes...`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
export { _page as default };
