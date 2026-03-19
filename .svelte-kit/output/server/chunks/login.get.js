//#region server/api/auth/login.get.ts
var login_get_default = defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const redirectUri = process.env.NUXT_OAUTH_REDIRECT_URI || "http://localhost:8787/api/auth/callback";
	const query = {
		client_id: config.oauthClientId,
		redirect_uri: redirectUri,
		response_type: "code"
	};
	const finalUrl = `https://accounts.betterseqta.org/oauth/authorize?${new URLSearchParams(query).toString()}`;
	console.log("[Auth] Redirecting to:", finalUrl);
	return new Response(null, {
		status: 302,
		headers: { "Location": finalUrl }
	});
});
//#endregion
export { login_get_default as default };
