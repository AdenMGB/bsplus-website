//#region server/api/auth/callback.get.ts
var callback_get_default = defineEventHandler(async (event) => {
	const config = useRuntimeConfig();
	const code = getQuery(event).code;
	const redirectUri = process.env.NUXT_OAUTH_REDIRECT_URI || "http://localhost:8787/api/auth/callback";
	if (!code) return sendRedirect(event, "/?error=no_code");
	try {
		const tokenResponse = await $fetch("https://accounts.betterseqta.org/api/oauth/token", {
			method: "POST",
			body: {
				client_id: config.oauthClientId,
				client_secret: config.oauthClientSecret,
				code,
				grant_type: "authorization_code",
				redirect_uri: redirectUri
			}
		});
		if (tokenResponse.error) {
			console.error("OAuth Error:", tokenResponse.error);
			return sendRedirect(event, "/?error=oauth_failed");
		}
		const accessToken = tokenResponse.access_token;
		const expiresIn = tokenResponse.expires_in || 3600;
		setCookie(event, "auth_token", accessToken, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			maxAge: expiresIn,
			path: "/",
			sameSite: "lax"
		});
		return sendRedirect(event, "/");
	} catch (e) {
		console.error("OAuth Callback Error:", e);
		return sendRedirect(event, "/?error=server_error");
	}
});
//#endregion
export { callback_get_default as default };
