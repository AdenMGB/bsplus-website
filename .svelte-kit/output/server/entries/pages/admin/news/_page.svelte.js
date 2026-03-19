import "../../../../chunks/index-server.js";
import { C as attr, T as escape_html, a as ensure_array_like } from "../../../../chunks/server.js";
import { t as Card } from "../../../../chunks/Card.js";
import "../../../../chunks/admin.js";
//#region src/routes/admin/news/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let posts = [];
		$$renderer.push(`<section class="space-y-8"><div class="flex flex-wrap items-end justify-between gap-4"><div class="space-y-3"><div class="section-subtitle">News</div> <h1 class="text-4xl font-semibold text-white">Manage posts</h1></div> <a class="btn-accent" href="/admin/news/create">Create post</a></div> <div class="space-y-4"><!--[-->`);
		const each_array = ensure_array_like(posts);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let post = each_array[$$index];
			Card($$renderer, {
				className: "space-y-4",
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex flex-wrap items-start justify-between gap-4"><div><h2 class="text-xl font-semibold text-white">${escape_html(post.title)}</h2> <div class="mt-2 text-sm text-soft">${escape_html(post.published ? "Published" : "Draft")} · ${escape_html(post.slug)}</div></div> <div class="flex flex-wrap gap-3"><a class="btn-ghost"${attr("href", `/admin/news/edit/${post.slug}`)}>Edit</a> <button class="btn-ghost" type="button">${escape_html(post.published ? "Unpublish" : "Publish")}</button> <button class="btn-ghost" type="button">Delete</button></div></div>`);
				},
				$$slots: { default: true }
			});
		}
		$$renderer.push(`<!--]--></div></section>`);
	});
}
//#endregion
export { _page as default };
