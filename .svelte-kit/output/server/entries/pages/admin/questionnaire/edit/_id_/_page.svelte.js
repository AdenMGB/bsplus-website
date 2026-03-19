import "../../../../../../chunks/index-server.js";
import "../../../../../../chunks/environment.js";
import "../../../../../../chunks/shared.js";
import "../../../../../../chunks/exports.js";
import "../../../../../../chunks/server.js";
import "../../../../../../chunks/internal.js";
import "../../../../../../chunks/state.js";
import { t as Card } from "../../../../../../chunks/Card.js";
import "../../../../../../chunks/admin.js";
//#region src/routes/admin/questionnaire/edit/[id]/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<section class="space-y-8">`);
		$$renderer.push("<!--[0-->");
		Card($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Loading question...`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!--]--></section>`);
	});
}
//#endregion
export { _page as default };
