import "../../../../chunks/index-server.js";
import "../../../../chunks/server.js";
import { t as Card } from "../../../../chunks/Card.js";
import "../../../../chunks/admin.js";
//#region src/routes/admin/questionnaire/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<section class="space-y-8"><div class="flex flex-wrap items-end justify-between gap-4"><div class="space-y-3"><div class="section-subtitle">Questionnaire</div> <h1 class="text-4xl font-semibold text-white">Daily questions</h1></div> <a class="btn-accent" href="/admin/questionnaire/create">Create question</a></div> `);
		$$renderer.push("<!--[0-->");
		Card($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Loading questions...`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
export { _page as default };
