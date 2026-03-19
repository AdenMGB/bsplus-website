import "../../../../../chunks/server.js";
import { t as Card } from "../../../../../chunks/Card.js";
//#region src/routes/admin/news/create/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		$$renderer.push(`<section class="space-y-8"><div class="space-y-3"><div class="section-subtitle">News</div> <h1 class="text-4xl font-semibold text-white">Create post</h1></div> `);
		Card($$renderer, {
			className: "space-y-5",
			children: ($$renderer) => {
				$$renderer.push(`<form class="space-y-4"><input class="input-surface" name="title" placeholder="Title" required=""/> <input class="input-surface" name="slug" placeholder="slug" required=""/> <input class="input-surface" name="cover_image" placeholder="Cover image URL"/> <textarea class="input-surface min-h-[22rem]" name="content" placeholder="HTML content" required=""></textarea> <label class="flex items-center gap-3 text-sm text-muted"><input name="published" type="checkbox"/> Publish immediately</label> <button class="btn-accent" type="submit">Create post</button></form>`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></section>`);
	});
}
//#endregion
export { _page as default };
