import { redirect } from "@sveltejs/kit";
//#region src/lib/server/auth.ts
async function getUserFromRequest(event) {
	const token = event.cookies.get("auth_token") ?? event.request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
	if (!token) return null;
	try {
		const response = await fetch("https://accounts.betterseqta.org/api/oauth/userinfo", { headers: { Authorization: `Bearer ${token}` } });
		if (!response.ok) {
			event.cookies.delete("auth_token", { path: "/" });
			return null;
		}
		const user = await response.json();
		if (user.pfpUrl?.startsWith("/pfp/")) user.pfpUrl = `https://accounts.betterseqta.org${user.pfpUrl}`;
		else if (user.pfpUrl?.startsWith("https://betterseqta.org/pfp/")) user.pfpUrl = user.pfpUrl.replace("https://betterseqta.org/pfp/", "https://accounts.betterseqta.org/pfp/");
		return user;
	} catch {
		return null;
	}
}
async function requireAdminPage(event) {
	if (!event.locals.user || !event.locals.user.admin_level || event.locals.user.admin_level < 1) redirect(307, "/");
}
//#endregion
export { requireAdminPage as n, getUserFromRequest as t };
