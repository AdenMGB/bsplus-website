import { n as requireAdminPage } from "../../../chunks/auth.js";
//#region src/routes/admin/+layout.server.ts
var load = async (event) => {
	await requireAdminPage(event);
	return {
		user: event.locals.user,
		seo: {
			title: "Admin | BetterSEQTA+",
			description: "BetterSEQTA administration panel.",
			canonical: "https://betterseqta.org/admin",
			noindex: true
		}
	};
};
//#endregion
export { load };
