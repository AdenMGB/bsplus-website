//#region server/api/auth/extension/login.post.ts
/**
* Extension/DesQTA login: username + password → access token.
* Proxies to accounts.betterseqta.org using OAuth2 resource owner password credentials grant.
* No OAuth redirect, no Discord - direct credentials exchange.
*/
var login_post_default = defineEventHandler(async (event) => {
	const body = await readBody(event);
	if (!body?.username || !body?.password) throw createError({
		statusCode: 400,
		statusMessage: "username and password are required"
	});
	const config = useRuntimeConfig();
	try {
		const tokenResponse = await $fetch("https://accounts.betterseqta.org/api/oauth/token", {
			method: "POST",
			body: {
				grant_type: "password",
				username: body.username,
				password: body.password,
				client_id: config.oauthClientId,
				client_secret: config.oauthClientSecret
			}
		});
		if (tokenResponse.error || !tokenResponse.access_token) throw createError({
			statusCode: 401,
			statusMessage: "Invalid credentials"
		});
		return {
			access_token: tokenResponse.access_token,
			expires_in: tokenResponse.expires_in ?? 3600
		};
	} catch (e) {
		if (e && typeof e === "object" && "statusCode" in e) throw e;
		throw createError({
			statusCode: 401,
			statusMessage: "Authentication failed"
		});
	}
});
//#endregion
export { login_post_default as default };
