import "../../../../../chunks/server.js";
import { t as Card } from "../../../../../chunks/Card.js";
//#region src/routes/admin/collections/new/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<section class="space-y-8"><div class="space-y-3"><div class="section-subtitle">Collections</div> <h1 class="text-4xl font-semibold text-white">Create collection</h1></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--> `);
		Card($$renderer, {
			className: "space-y-5",
			children: ($$renderer) => {
				$$renderer.push(`<form class="space-y-4"><input class="input-surface" name="name" placeholder="Collection name" required=""/> <input class="input-surface" name="slug" placeholder="collection-slug"/> <textarea class="input-surface min-h-32" name="description" placeholder="Description"></textarea> <input class="input-surface" name="theme_ids" placeholder="Theme IDs, comma separated" required=""/> <input class="input-surface" name="cover_image" placeholder="Cover image URL or uploaded image URL"/> <label class="flex items-center gap-3 text-sm text-muted"><input name="featured" type="checkbox"/> Featured</label> <button class="btn-accent" type="submit">Create collection</button></form>`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></section>`);
	});
}
//#endregion
export { _page as default };
