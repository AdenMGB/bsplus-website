//#region server/utils/auth.ts
function authHeaders(event) {
	const headers = { cookie: getHeader(event, "cookie") || "" };
	const auth = getHeader(event, "authorization");
	if (auth) headers.authorization = auth;
	return headers;
}
async function requireAdmin(event) {
	const user = await $fetch("/api/auth/me", { headers: authHeaders(event) }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		statusMessage: "Forbidden - Admin access required"
	});
	return user;
}
async function getOptionalUser(event) {
	try {
		return await $fetch("/api/auth/me", { headers: authHeaders(event) });
	} catch {
		return null;
	}
}
//#endregion
export { requireAdmin as n, getOptionalUser as t };
