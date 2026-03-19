import { T as escape_html, d as html, i as derived } from "../../../chunks/server.js";
import { t as Card } from "../../../chunks/Card.js";
//#region src/routes/privacy/+page.svelte
function _page($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { data } = $$props;
		const policy = derived(() => data.policy ?? null);
		$$renderer.push(`<section class="mx-auto max-w-5xl space-y-8 pb-14 pt-6"><div class="space-y-4"><div class="section-subtitle">Privacy</div> <h1 class="section-title">A clear statement on how BetterSEQTA handles your data.</h1> `);
		if (policy()?.last_updated) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<p class="text-sm text-soft">Last updated: ${escape_html(new Date(policy().last_updated).toLocaleString())}</p>`);
		} else $$renderer.push("<!--[-1-->");
		$$renderer.push(`<!--]--></div> `);
		Card($$renderer, {
			className: "prose-theme max-w-none",
			children: ($$renderer) => {
				$$renderer.push(`${html(policy()?.whatsnew_html ?? "<p>Privacy information is currently unavailable.</p>")}`);
			},
			$$slots: { default: true }
		});
		$$renderer.push(`<!----></section>`);
	});
}
//#endregion
export { _page as default };
