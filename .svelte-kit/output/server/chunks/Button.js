import { C as attr, i as derived, t as attr_class, w as clsx } from "./server.js";
//#region src/lib/components/ui/Button.svelte
function Button($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { href, type = "button", variant = "accent", className = "", disabled = false, children } = $$props;
		const classes = derived(() => `${variant === "accent" ? "btn-accent" : "btn-ghost"} ${className}`.trim());
		if (href) {
			$$renderer.push("<!--[0-->");
			$$renderer.push(`<a${attr_class(clsx(classes()))}${attr("href", href)}${attr("aria-disabled", disabled)}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></a>`);
		} else {
			$$renderer.push("<!--[-1-->");
			$$renderer.push(`<button${attr_class(clsx(classes()))}${attr("type", type)}${attr("disabled", disabled, true)}>`);
			children?.($$renderer);
			$$renderer.push(`<!----></button>`);
		}
		$$renderer.push(`<!--]-->`);
	});
}
//#endregion
export { Button as t };
