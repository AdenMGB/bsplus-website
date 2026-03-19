import { T as escape_html, a as ensure_array_like } from "../../../chunks/server.js";
import { c as ComputerDesktop, l as DevicePhoneMobile, n as ArrowDownTray, o as ArrowTopRightOnSquare, t as Icon } from "../../../chunks/dist.js";
import { t as Button } from "../../../chunks/Button.js";
import { t as Card } from "../../../chunks/Card.js";
import { r as downloadPlatforms } from "../../../chunks/site.js";
//#region src/routes/download/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		$$renderer.push(`<section class="space-y-10 pb-12 pt-6 md:space-y-12 md:pt-10"><div class="hero-panel px-6 py-8 md:px-8 md:py-10 xl:px-12"><div class="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end"><div class="space-y-5"><div class="eyebrow-badge">Downloads</div> <h1 class="section-title max-w-4xl">Choose the BetterSEQTA experience that fits how you work.</h1> <p class="hero-kicker">Install the extension for the quickest upgrade, or download DesQTA for the full desktop experience with a wider layout and room for more powerful workflows.</p> <div class="flex flex-wrap gap-3">`);
		Button($$renderer, {
			href: "#desqta-downloads",
			children: ($$renderer) => {
				Icon($$renderer, {
					class: "h-5 w-5",
					src: ArrowDownTray
				});
				$$renderer.push(`<!----> Desktop downloads`);
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
					src: ArrowTopRightOnSquare
				});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></div></div> <div class="grid gap-4 sm:grid-cols-2"><div class="metric-card"><div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Desktop release</div> <div class="mt-3 text-2xl font-semibold text-white">${escape_html(data.release?.tag_name ?? "Latest build")}</div> <div class="mt-1 text-sm text-muted">Current DesQTA version across supported platforms.</div></div> <div class="metric-card"><div class="text-xs font-semibold uppercase tracking-[0.18em] text-soft">Install choices</div> <div class="mt-3 text-2xl font-semibold text-white">Browser + desktop</div> <div class="mt-1 text-sm text-muted">Chrome, Edge, Firefox, Windows, macOS, Android, and more.</div></div></div></div></div> <section class="space-y-6"><div class="max-w-3xl space-y-3"><div class="section-subtitle">Extension install</div> <h2 class="text-3xl font-semibold tracking-tight text-white md:text-4xl">Get BetterSEQTA+ in your browser in a few clicks.</h2> <p class="text-lg leading-8 text-muted">Fastest way to improve SEQTA Learn if you already live in your browser day to day.</p></div> <div class="grid gap-5 md:grid-cols-3">`);
		Card($$renderer, {
			className: "space-y-5 p-6 md:p-7",
			children: ($$renderer) => {
				$$renderer.push(`<div class="space-y-2"><div class="section-subtitle">Chrome</div> <h3 class="text-2xl font-semibold text-white">Chrome Web Store</h3> <p class="text-muted">Install the main browser build for Chrome and Chromium-based browsers.</p></div> `);
				Button($$renderer, {
					href: "https://chromewebstore.google.com/detail/betterseqta+/afdgaoaclhkhemfkkkonemoapeinchel",
					children: ($$renderer) => {
						$$renderer.push(`<!---->Add to Chrome`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----> `);
		Card($$renderer, {
			className: "space-y-5 p-6 md:p-7",
			children: ($$renderer) => {
				$$renderer.push(`<div class="space-y-2"><div class="section-subtitle">Edge</div> <h3 class="text-2xl font-semibold text-white">Microsoft Edge</h3> <p class="text-muted">Same fast install path for Edge users who want the browser-first experience.</p></div> `);
				Button($$renderer, {
					href: "https://chromewebstore.google.com/detail/betterseqta+/afdgaoaclhkhemfkkkonemoapeinchel",
					children: ($$renderer) => {
						$$renderer.push(`<!---->Add to Edge`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----> `);
		Card($$renderer, {
			className: "space-y-5 p-6 md:p-7",
			children: ($$renderer) => {
				$$renderer.push(`<div class="space-y-2"><div class="section-subtitle">Firefox</div> <h3 class="text-2xl font-semibold text-white">Mozilla Add-ons</h3> <p class="text-muted">Grab the Firefox version if you want BetterSEQTA+ without switching browsers.</p></div> `);
				Button($$renderer, {
					href: "https://addons.mozilla.org/en-US/firefox/addon/betterseqta-plus/",
					children: ($$renderer) => {
						$$renderer.push(`<!---->Add to Firefox`);
					},
					$$slots: { default: true }
				});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></div></section> <section class="space-y-6" id="desqta-downloads"><div class="max-w-3xl space-y-3"><div class="section-subtitle">Desktop and mobile</div> <h2 class="text-3xl font-semibold tracking-tight text-white md:text-4xl">Download DesQTA for the devices you already use.</h2> <p class="text-lg leading-8 text-muted">The full BetterSEQTA desktop experience with platform-native installs and room for a much broader UI.</p></div> <div class="grid gap-5 lg:grid-cols-2 2xl:grid-cols-4"><!--[-->`);
		const each_array = ensure_array_like(downloadPlatforms);
		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let platform = each_array[$$index];
			Card($$renderer, {
				className: "flex h-full flex-col gap-5 p-6 md:p-7",
				children: ($$renderer) => {
					$$renderer.push(`<div class="flex items-start justify-between gap-4"><div class="space-y-2"><div class="section-subtitle">${escape_html(platform.label)}</div> <h3 class="text-2xl font-semibold text-white">${escape_html(platform.label)}</h3></div> <div class="rounded-2xl border border-white/8 bg-white/5 p-3 text-white">`);
					if (platform.key === "android") {
						$$renderer.push("<!--[0-->");
						Icon($$renderer, {
							class: "h-6 w-6",
							src: DevicePhoneMobile
						});
					} else {
						$$renderer.push("<!--[-1-->");
						Icon($$renderer, {
							class: "h-6 w-6",
							src: ComputerDesktop
						});
					}
					$$renderer.push(`<!--]--></div></div> <p class="text-base leading-7 text-muted">${escape_html(platform.blurb)}</p> `);
					if (data.release?.tag_name) {
						$$renderer.push("<!--[0-->");
						$$renderer.push(`<div class="rounded-2xl border border-white/8 bg-white/3 px-4 py-3 text-sm text-soft">Latest release: <span class="font-semibold text-white">${escape_html(data.release.tag_name)}</span></div>`);
					} else $$renderer.push("<!--[-1-->");
					$$renderer.push(`<!--]--> <div class="mt-auto space-y-3">`);
					if (platform.key === "windows") {
						$$renderer.push("<!--[0-->");
						Button($$renderer, {
							href: data.links.exe || "#",
							children: ($$renderer) => {
								$$renderer.push(`<!---->${escape_html(platform.primary)}`);
							},
							$$slots: { default: true }
						});
						$$renderer.push(`<!----> `);
						Button($$renderer, {
							href: data.links.msi || "#",
							variant: "ghost",
							children: ($$renderer) => {
								$$renderer.push(`<!---->Download MSI`);
							},
							$$slots: { default: true }
						});
						$$renderer.push(`<!---->`);
					} else if (platform.key === "macos") {
						$$renderer.push("<!--[1-->");
						Button($$renderer, {
							href: data.links.dmg || "#",
							children: ($$renderer) => {
								$$renderer.push(`<!---->${escape_html(platform.primary)}`);
							},
							$$slots: { default: true }
						});
					} else if (platform.key === "android") {
						$$renderer.push("<!--[2-->");
						Button($$renderer, {
							href: data.links.apk || "#",
							children: ($$renderer) => {
								$$renderer.push(`<!---->${escape_html(platform.primary)}`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push("<!--[-1-->");
						Button($$renderer, {
							variant: "ghost",
							className: "w-full justify-center opacity-70",
							children: ($$renderer) => {
								$$renderer.push(`<!---->${escape_html(platform.primary)}`);
							},
							$$slots: { default: true }
						});
					}
					$$renderer.push(`<!--]--></div>`);
				},
				$$slots: { default: true }
			});
		}
		$$renderer.push(`<!--]--></div></section></section>`);
	});
}
//#endregion
export { _page as default };
