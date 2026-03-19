//#region server/api/auth/me.get.ts
var me_get_default = defineEventHandler(async (event) => {
	const authHeader = getHeader(event, "authorization");
	const token = (authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null) || getCookie(event, "auth_token");
	if (!token) throw createError({
		statusCode: 401,
		statusMessage: "Unauthorized"
	});
	try {
		const user = await $fetch("https://accounts.betterseqta.org/api/oauth/userinfo", { headers: { Authorization: `Bearer ${token}` } });
		if (user.pfpUrl) {
			user.pfpUrl = user.pfpUrl.replace("https://betterseqta.org/pfp/", "https://accounts.betterseqta.org/pfp/");
			if (user.pfpUrl.startsWith("/pfp/")) user.pfpUrl = `https://accounts.betterseqta.org${user.pfpUrl}`;
		}
		return user;
	} catch (e) {
		deleteCookie(event, "auth_token");
		throw createError({
			statusCode: 401,
			statusMessage: "Invalid Token"
		});
	}
});
//#endregion
export { me_get_default as default };
