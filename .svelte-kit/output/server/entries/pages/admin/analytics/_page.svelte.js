import "../../../../chunks/index-server.js";
import "../../../../chunks/server.js";
import { t as Card } from "../../../../chunks/Card.js";
import "../../../../chunks/admin.js";
//#region src/routes/admin/analytics/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<section class="space-y-8"><div class="space-y-3"><div class="section-subtitle">Analytics</div> <h1 class="text-4xl font-semibold text-white">Usage and marketplace health</h1></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		$$renderer.push("<!--[0-->");
		Card($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Loading analytics...`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
export { _page as default };
