import { i as derived, t as attr_class, w as clsx } from "./server.js";
//#region src/lib/components/ui/Card.svelte
function Card($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { className = "", hover = true, children } = $$props;
		const classes = derived(() => `glass-card p-6 md:p-8 ${hover ? "hover:-translate-y-1 hover:scale-[1.015]" : ""} transition-all duration-200 ${className}`.trim());
		$$renderer.push(`<div${attr_class(clsx(classes()))}>`);
		children?.($$renderer);
		$$renderer.push(`<!----></div>`);
	});
}
//#endregion
export { Card as t };
