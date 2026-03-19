import { C as attr } from "../../../../../chunks/server.js";
import { t as Card } from "../../../../../chunks/Card.js";
//#region src/routes/admin/questionnaire/create/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let mode = "manual";
		$$renderer.push(`<section class="space-y-8"><div class="space-y-3"><div class="section-subtitle">Questionnaire</div> <h1 class="text-4xl font-semibold text-white">Create question</h1></div> `);
		Card($$renderer, {
			className: "space-y-5",
			children: ($$renderer) => {
				$$renderer.push(`<form class="space-y-4"><input class="input-surface" name="question" placeholder="Question" required=""/> <textarea class="input-surface min-h-32" name="options" placeholder="One option per line" required=""></textarea> <input class="input-surface" name="cover_image" placeholder="Cover image URL"/> <div class="flex gap-3 text-sm text-muted"><label><input${attr("checked", mode === "manual", true)} name="mode" type="radio"/> Manual expiry</label> <label><input${attr("checked", mode === "queued", true)} name="mode" type="radio"/> Queue question</label></div> `);
				if (mode === "manual") {
					$$renderer.push("<!--[0-->");
					$$renderer.push(`<input class="input-surface" name="expiresAt" placeholder="YYYY-MM-DD HH:mm" required=""/>`);
				} else {
					$$renderer.push("<!--[-1-->");
					$$renderer.push(`<input class="input-surface" name="duration" placeholder="Duration in seconds" type="number" required=""/> <input class="input-surface" name="queue_order" placeholder="Queue order" type="number" required=""/>`);
				}
				$$renderer.push(`<!--]--> <button class="btn-accent" type="submit">Create question</button></form>`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></section>`);
	});
}
//#endregion
export { _page as default };
