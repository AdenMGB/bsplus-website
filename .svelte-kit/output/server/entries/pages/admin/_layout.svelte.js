import "../../../chunks/index-server.js";
import "../../../chunks/environment.js";
import "../../../chunks/shared.js";
import "../../../chunks/exports.js";
import { C as attr, T as escape_html, a as ensure_array_like, t as attr_class } from "../../../chunks/server.js";
import "../../../chunks/internal.js";
import { t as page } from "../../../chunks/state.js";
//#region src/routes/admin/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { children } = $$props;
		const links = [
			{
				href: "/admin",
				label: "Dashboard"
			},
			{
				href: "/admin/analytics",
				label: "Analytics"
			},
			{
				href: "/admin/themes",
				label: "Themes"
			},
			{
				href: "/admin/collections",
				label: "Collections"
			},
			{
				href: "/admin/questionnaire",
				label: "Questionnaire"
			},
			{
				href: "/admin/news",
				label: "News"
			}
		];
		const active = (href) => href === "/admin" ? page.url.pathname === href : page.url.pathname.startsWith(href);
		$$renderer.push(`<div class="admin-shell"><aside class="admin-sidebar"><div class="glass-card h-fit p-5 md:p-6"><div class="space-y-4"><div class="eyebrow-badge">Admin</div> <div><div class="text-2xl font-semibold tracking-tight text-white">Control center</div> <p class="mt-2 text-sm leading-7 text-muted">Manage analytics, marketplace items, questionnaires, and content from one place.</p></div></div> <nav class="mt-6 space-y-2"><!--[-->`);
		const each_array = ensure_array_like(links);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let link = each_array[$$index];
			$$renderer.push(`<a${attr_class(`block rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200 ${active(link.href) ? "border-white/10 bg-white/8 text-white accent-ring" : "border-transparent text-muted hover:border-white/8 hover:bg-white/5 hover:text-white"}`)}${attr("href", link.href)}>${escape_html(link.label)}</a>`);
		}
		$$renderer.push(`<!--]--></nav></div></aside> <section class="min-w-0">`);
		children($$renderer);
		$$renderer.push(`<!----></section></div>`);
	});
}
//#endregion
export { _layout as default };
