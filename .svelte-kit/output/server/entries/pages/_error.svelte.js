import { T as escape_html } from "../../chunks/server.js";
import { t as Button } from "../../chunks/Button.js";
//#region src/routes/+error.svelte
function _error($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { error, status } = $$props;
		$$renderer.push(`<div class="mx-auto flex min-h-[60vh] max-w-3xl items-center justify-center"><div class="glass-card w-full space-y-6 p-8 text-center md:p-12"><div class="section-subtitle">Something went wrong</div> <h1 class="section-title">${escape_html(status)}</h1> <p class="mx-auto max-w-2xl text-base text-muted">${escape_html(error?.message ?? "The page could not be rendered.")}</p> <div class="flex flex-wrap justify-center gap-3">`);
		Button($$renderer, {
			href: "/",
			children: ($$renderer) => {
				$$renderer.push(`<!---->Back home`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----> `);
		Button($$renderer, {
			href: "/download",
			variant: "ghost",
			children: ($$renderer) => {
				$$renderer.push(`<!---->Go to downloads`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></div></div></div>`);
	});
}
//#endregion
export { _error as default };
