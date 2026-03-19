import { T as escape_html, a as ensure_array_like, i as derived, t as attr_class } from "../../chunks/server.js";
import { d as Sparkles, f as Swatch, i as ArrowRight, n as ArrowDownTray, t as Icon, u as Moon } from "../../chunks/dist.js";
import { t as Button } from "../../chunks/Button.js";
import { t as Card } from "../../chunks/Card.js";
import { i as featureCards } from "../../chunks/site.js";
//#region src/routes/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const bsPlusVersion = derived(() => data.bsPlusRelease?.tag_name?.replace("betterseqtaplus@", "v"));
		const desqtaVersion = derived(() => data.desqtaRelease?.tag_name);
		const releaseHighlights = derived(() => [{
			label: "Browser extension",
			title: "BetterSEQTA+",
			accent: "text-white",
			description: "Themes, wallpapers, and a much cleaner SEQTA experience directly in your browser.",
			version: bsPlusVersion() ?? "Available now",
			href: "/download",
			secondary: "/comparison"
		}, {
			label: "Desktop app",
			title: "DesQTA",
			accent: "text-sky-300",
			description: "A wider desktop workspace with native installs, stronger structure, and deeper platform integration.",
			version: desqtaVersion() ?? "Latest release available",
			href: "/desqta",
			secondary: "/download"
		}]);
		$$renderer.push(`<section class="space-y-10 pb-10 pt-6 md:space-y-14 md:pt-10"><div class="hero-panel px-6 py-8 md:px-8 md:py-10 xl:px-12 xl:py-12"><div class="hero-grid items-start"><div class="space-y-7"><div class="eyebrow-badge">SEQTA Learn Enhanced</div> <div class="space-y-5"><h1 class="section-title max-w-5xl">BetterSEQTA+ and DesQTA make SEQTA feel polished, modern, and actually enjoyable to use.</h1> <p class="hero-kicker">The same routes and workflows you already know, rebuilt with stronger dark mode styling,
            better hierarchy, custom themes, live wallpapers, and a wider desktop experience that feels like a real product.</p></div> <div class="flex flex-wrap items-center gap-3">`);
		Button($$renderer, {
			href: "/download",
			children: ($$renderer) => {
				Icon($$renderer, {
					class: "h-5 w-5",
					src: ArrowDownTray
				});
				$$renderer.push(`<!----> Download now`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----> `);
		Button($$renderer, {
			href: "/comparison",
			variant: "ghost",
			children: ($$renderer) => {
				$$renderer.push(`<!---->Compare editions `);
				Icon($$renderer, {
					class: "h-5 w-5",
					src: ArrowRight
				});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></div> <div class="stat-grid"><div class="metric-card"><div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Latest extension</div> <div class="mt-3 text-2xl font-semibold text-white">${escape_html(bsPlusVersion() ?? "Available now")}</div> <div class="mt-1 text-sm text-muted">BetterSEQTA+ browser release</div></div> <div class="metric-card"><div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Latest desktop</div> <div class="mt-3 text-2xl font-semibold text-white">${escape_html(desqtaVersion() ?? "Available now")}</div> <div class="mt-1 text-sm text-muted">DesQTA app release</div></div> <div class="metric-card"><div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Deployment stack</div> <div class="mt-3 text-2xl font-semibold text-white">Cloudflare-native</div> <div class="mt-1 text-sm text-muted">Workers, D1, R2, and SvelteKit</div></div></div></div> <div class="grid gap-5"><!--[-->`);
		const each_array = ensure_array_like(releaseHighlights());
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let item = each_array[$$index];
			$$renderer.push(`<div class="section-panel min-h-60"><div class="flex h-full flex-col justify-between gap-5"><div class="space-y-4"><div class="section-subtitle">${escape_html(item.label)}</div> <div><h2${attr_class(`text-3xl font-semibold tracking-tight ${item.accent}`)}>${escape_html(item.title)}</h2> <div class="mt-2 text-sm font-medium text-soft">${escape_html(item.version)}</div></div> <p class="text-base leading-7 text-muted">${escape_html(item.description)}</p></div> <div class="flex flex-wrap gap-3">`);
			Button($$renderer, {
				href: item.href,
				children: ($$renderer) => {
					$$renderer.push(`<!---->Open`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----> `);
			Button($$renderer, {
				href: item.secondary,
				variant: "ghost",
				children: ($$renderer) => {
					$$renderer.push(`<!---->Learn more`);
				},
				$$slots: { default: true }
			});
			$$renderer.push(`<!----></div></div></div>`);
		}
		$$renderer.push(`<!--]--></div></div></div> <section class="space-y-8"><div class="max-w-4xl space-y-4"><div class="section-subtitle">Designed to feel better</div> <h2 class="text-3xl font-semibold tracking-tight text-white md:text-5xl">Pulling the best parts of the old look forward, then pushing them a lot further.</h2> <p class="text-lg leading-8 text-muted">The original visual style had the right ingredients: soft glass cards, heavy dark surfaces, bright call-to-actions, and subtle ambient glows.
        This new pass doubles down on those ideas with better spacing, stronger contrast, and clearer product separation.</p></div> <div class="grid gap-6 lg:grid-cols-3"><!--[-->`);
		const each_array_1 = ensure_array_like(featureCards);
		for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
			let card = each_array_1[index];
			Card($$renderer, {
				className: "space-y-5 p-7 md:p-8",
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex h-14 w-14 items-center justify-center rounded-3xl border border-white/8 bg-white/5 text-white shadow-xl">`);
					if (index === 0) {
						$$renderer.push("<!--[0-->");
						Icon($$renderer, {
							class: "h-6 w-6",
							src: Swatch
						});
					} else if (index === 1) {
						$$renderer.push("<!--[1-->");
						Icon($$renderer, {
							class: "h-6 w-6",
							src: Moon
						});
					} else {
						$$renderer.push("<!--[-1-->");
						Icon($$renderer, {
							class: "h-6 w-6",
							src: Sparkles
						});
					}
					$$renderer.push(`<!--]--></div> <h3 class="text-2xl font-semibold tracking-tight text-white">${escape_html(card.title)}</h3> <p class="text-base leading-7 text-muted">${escape_html(card.description)}</p>`);
				},
				$$slots: { default: true }
			});
		}
		$$renderer.push(`<!--]--></div></section> <section class="split-callout">`);
		Card($$renderer, {
			className: "space-y-4 p-7 md:p-8",
			hover: false,
			children: ($$renderer) => {
				$$renderer.push(`<div class="section-subtitle">BetterSEQTA+</div> <h3 class="text-2xl font-semibold text-white">The fastest upgrade path</h3> <ul class="feature-list text-sm"><li>Install once and immediately get a more personal, more readable SEQTA experience.</li> <li>Perfect for students who want themes, wallpapers, and faster day-to-day browsing.</li> <li>Available across major browsers with a lightweight install flow.</li></ul>`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----> `);
		Card($$renderer, {
			className: "space-y-4 p-7 md:p-8",
			hover: false,
			children: ($$renderer) => {
				$$renderer.push(`<div class="section-subtitle">DesQTA</div> <h3 class="text-2xl font-semibold text-white">The full desktop workspace</h3> <ul class="feature-list text-sm"><li>Native installs, broader layout space, and room for bigger productivity features.</li> <li>Built for a more serious desktop workflow without losing the BetterSEQTA identity.</li> <li>Ideal if you want the most capable version of the ecosystem.</li></ul>`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></section> <section class="pb-8 pt-2 md:pb-14"><div class="hero-panel px-6 py-8 md:px-8 md:py-10"><div class="flex flex-col gap-6 md:flex-row md:items-end md:justify-between"><div class="max-w-3xl space-y-4"><div class="section-subtitle">Ready to switch?</div> <h2 class="text-3xl font-semibold tracking-tight text-white md:text-5xl">Start with the extension, go all-in with desktop, or compare both side by side.</h2> <p class="text-lg leading-8 text-muted">However you want to use BetterSEQTA, the goal stays the same: cleaner interface, better dark mode, and a much more intentional product experience.</p></div> <div class="flex flex-wrap gap-3">`);
		Button($$renderer, {
			href: "/download",
			children: ($$renderer) => {
				$$renderer.push(`<!---->Download`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----> `);
		Button($$renderer, {
			href: "/desqta",
			variant: "ghost",
			children: ($$renderer) => {
				$$renderer.push(`<!---->Explore DesQTA`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></div></div></div></section></section>`);
	});
}
//#endregion
export { _page as default };
