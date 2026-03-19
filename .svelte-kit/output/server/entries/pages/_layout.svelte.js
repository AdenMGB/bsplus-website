import "../../chunks/index-server.js";
import "../../chunks/environment.js";
import "../../chunks/shared.js";
import "../../chunks/exports.js";
import { C as attr, T as escape_html, a as ensure_array_like, i as derived, o as head } from "../../chunks/server.js";
import "../../chunks/internal.js";
import { t as page } from "../../chunks/state.js";
import { a as ArrowRightOnRectangle, r as ArrowLeftOnRectangle, s as Bars3, t as Icon } from "../../chunks/dist.js";
import { t as Button } from "../../chunks/Button.js";
//#region src/lib/components/layout/SiteHeader.svelte
function SiteHeader($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { user = null } = $$props;
		let mobileOpen = false;
		const routes = [
			{
				href: "/",
				label: "Home"
			},
			{
				href: "/desqta",
				label: "DesQTA"
			},
			{
				href: "/comparison",
				label: "Comparison"
			},
			{
				href: "/download",
				label: "Download"
			},
			{
				href: "/news",
				label: "News"
			},
			{
				href: "/changelogs",
				label: "Changelogs"
			},
			{
				href: "/privacy",
				label: "Privacy"
			}
		];
		const isActive = (href) => {
			if (href === "/") return page.url.pathname === href;
			return page.url.pathname.startsWith(href);
		};
		$$renderer.push(`<header class="sticky top-0 z-50 px-3 pt-3 md:px-4"><div class="layout-container-wide glass-panel rounded-[1.35rem] border-white/8"><div class="flex items-center justify-between gap-4 px-4 py-4 md:px-5"><a class="flex items-center gap-3 text-white" href="/"><div class="relative"><div class="absolute inset-0 rounded-2xl bg-(--accent-soft) blur-lg"></div> <img alt="BetterSEQTA" class="relative h-11 w-11 rounded-2xl border border-white/10 bg-slate-950/90 p-1.5 shadow-2xl" src="https://raw.githubusercontent.com/BetterSEQTA/DesQTA/refs/heads/develop/static/32x32.png"/></div> <div><div class="text-[0.95rem] font-semibold tracking-tight text-white">BetterSEQTA+</div> <div class="text-xs text-soft">Themes, downloads, news, and desktop tools</div></div></a> <nav class="hidden items-center gap-1 lg:flex"><!--[-->`);
		const each_array = ensure_array_like(routes);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let route = each_array[$$index];
			$$renderer.push(`<a class="nav-link nav-pill"${attr("href", route.href)}${attr("aria-current", isActive(route.href) ? "page" : void 0)}>${escape_html(route.label)}</a>`);
		}
		$$renderer.push(`<!--]--></nav> <div class="hidden items-center gap-3 lg:flex">`);
		if (user) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<a class="nav-link inline-flex items-center gap-3 rounded-full border border-white/8 bg-white/3 px-3 py-2 text-sm" href="https://accounts.betterseqta.org" rel="noreferrer" target="_blank"><img${attr("alt", user.username)} class="h-8 w-8 rounded-full border border-white/10 object-cover shadow-lg"${attr("src", user.pfpUrl ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName ?? user.username)}`)}/> <span class="max-w-40 truncate">${escape_html(user.displayName ?? user.username)}</span></a> `);
			if (user.admin_level && user.admin_level >= 1) {
				$$renderer.push("<!--[0-->");
				Button($$renderer, {
					href: "/admin",
					variant: "ghost",
					className: "text-sm",
					children: ($$renderer) => {
						$$renderer.push(`<!---->Admin`);
					},
					$$slots: { default: true }
				});
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]--> <form action="/api/auth/logout" method="POST"><button class="btn-ghost text-sm" type="submit">`);
			Icon($$renderer, {
				class: "h-5 w-5",
				src: ArrowLeftOnRectangle
			});
			$$renderer.push(`<!----> Logout</button></form>`);
		} else {
			$$renderer.push("<!--[-1-->");
			Button($$renderer, {
				href: "/api/auth/login",
				className: "text-sm",
				children: ($$renderer) => {
					Icon($$renderer, {
						class: "h-5 w-5",
						src: ArrowRightOnRectangle
					});
					$$renderer.push(`<!----> Login`);
				},
				$$slots: { default: true }
			});
		}
		$$renderer.push(`<!--]--></div> <button class="btn-ghost lg:hidden" type="button"${attr("aria-expanded", mobileOpen)}${attr("aria-label", "Open menu")}>`);
		$$renderer.push("<!--[-1-->");
		Icon($$renderer, {
			class: "h-5 w-5",
			src: Bars3
		});
		$$renderer.push(`<!--]--></button></div> `);
		$$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div></header>`);
	});
}
//#endregion
//#region src/lib/components/layout/SiteFooter.svelte
function SiteFooter($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const links = [
			{
				href: "/privacy",
				label: "Privacy Policy"
			},
			{
				href: "/download",
				label: "Download"
			},
			{
				href: "/news",
				label: "News"
			},
			{
				href: "/changelogs",
				label: "Changelogs"
			}
		];
		const social = [{
			href: "https://github.com/BetterSEQTA/BetterSEQTA-Plus",
			label: "GitHub"
		}, {
			href: "https://discord.gg/nv6YSjpEM4",
			label: "Discord"
		}];
		$$renderer.push(`<footer class="mt-12 px-4 pb-6 pt-10 md:mt-18"><div class="layout-container-wide"><div class="glass-card rounded-[1.75rem] px-6 py-8 md:px-8 md:py-10"><div class="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]"><div class="space-y-5"><div class="eyebrow-badge">BetterSEQTA Ecosystem</div> <div class="flex items-center gap-4"><div class="relative"><div class="absolute inset-0 rounded-2xl bg-(--accent-soft) blur-lg"></div> <img alt="BetterSEQTA" class="relative h-12 w-12 rounded-2xl border border-white/10 bg-slate-950/90 p-1.5" src="https://raw.githubusercontent.com/BetterSEQTA/DesQTA/refs/heads/develop/static/32x32.png"/></div> <div><div class="text-xl font-semibold tracking-tight text-white">BetterSEQTA+</div> <div class="text-sm text-soft">SEQTA Learn, redesigned across browser and desktop</div></div></div> <p class="max-w-3xl text-sm leading-7 text-muted">BetterSEQTA+ and DesQTA make SEQTA Learn faster, clearer, and more customizable with stronger dark mode styling, polished downloads, curated themes, and a more capable desktop experience.</p></div> <div class="grid gap-8 sm:grid-cols-2"><div class="space-y-4"><div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Navigation</div> <div class="flex flex-col gap-3 text-sm"><!--[-->`);
		const each_array = ensure_array_like(links);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let link = each_array[$$index];
			$$renderer.push(`<a class="nav-link"${attr("href", link.href)}>${escape_html(link.label)}</a>`);
		}
		$$renderer.push(`<!--]--></div></div> <div class="space-y-4"><div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Community</div> <div class="flex flex-col gap-3 text-sm"><!--[-->`);
		const each_array_1 = ensure_array_like(social);
		for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
			let link = each_array_1[$$index_1];
			$$renderer.push(`<a class="nav-link"${attr("href", link.href)} rel="noreferrer" target="_blank">${escape_html(link.label)}</a>`);
		}
		$$renderer.push(`<!--]--></div></div></div></div> <div class="mt-8 flex flex-col gap-3 border-t border-white/8 pt-5 text-xs text-soft md:flex-row md:items-center md:justify-between"><p>© ${escape_html((/* @__PURE__ */ new Date()).getFullYear())} BetterSEQTA+. Licensed under MIT.</p> <p>Built for Cloudflare Workers with SvelteKit.</p></div></div></div></footer>`);
	});
}
//#endregion
//#region src/routes/+layout.svelte
function _layout($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data, children } = $$props;
		const layoutSeo = derived(() => data.seo ?? void 0);
		const pageSeo = derived(() => page.data.seo ?? void 0);
		const seo = derived(() => ({
			title: pageSeo()?.title ?? layoutSeo()?.title ?? "BetterSEQTA+",
			description: pageSeo()?.description ?? layoutSeo()?.description ?? "BetterSEQTA+ and DesQTA enhance SEQTA Learn with themes, wallpapers, analytics, and a full desktop experience.",
			canonical: pageSeo()?.canonical ?? layoutSeo()?.canonical ?? `https://betterseqta.org${page.url.pathname}`,
			image: pageSeo()?.image ?? layoutSeo()?.image ?? "https://betterseqta.org/favicon-96x96.png",
			noindex: pageSeo()?.noindex ?? layoutSeo()?.noindex ?? false
		}));
		const jsonLd = derived(() => pageSeo()?.jsonLd ?? layoutSeo()?.jsonLd ?? null);
		head("12qhfyh", $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>${escape_html(seo().title)}</title>`);
			});
			$$renderer.push(`<meta name="description"${attr("content", seo().description)}/> <link rel="canonical"${attr("href", seo().canonical)}/> <meta name="robots"${attr("content", seo().noindex ? "noindex, nofollow" : "index, follow")}/> <meta property="og:title"${attr("content", seo().title)}/> <meta property="og:description"${attr("content", seo().description)}/> <meta property="og:url"${attr("content", seo().canonical)}/> <meta property="og:image"${attr("content", seo().image)}/> <meta property="og:type" content="website"/> <meta property="og:site_name" content="BetterSEQTA+"/> <meta name="twitter:card" content="summary_large_image"/> <meta name="twitter:title"${attr("content", seo().title)}/> <meta name="twitter:description"${attr("content", seo().description)}/> <meta name="twitter:image"${attr("content", seo().image)}/> `);
			if (jsonLd()) {
				$$renderer.push("<!--[0-->");
				$$renderer.push(`<script type="application/ld+json">{JSON.stringify(jsonLd)}<\/script>`);
				$$renderer.push(`<!---->`);
			} else $$renderer.push("<!--[-1-->");
			$$renderer.push(`<!--]-->`);
		});
		$$renderer.push(`<div class="page-shell">`);
		SiteHeader($$renderer, { user: data.user });
		$$renderer.push(`<!----> <main class="layout-container-wide px-4 py-8 md:py-12">`);
		children($$renderer);
		$$renderer.push(`<!----></main> `);
		SiteFooter($$renderer, {});
		$$renderer.push(`<!----></div>`);
	});
}
//#endregion
export { _layout as default };
