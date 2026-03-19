//#region server/utils/accounts.ts
/**
* Get accounts API credentials from the request context.
* Cloudflare-compatible: reads from event.context.cloudflare.env (Nitro v2)
* or event.req.runtime.cloudflare.env (Nitro v3) at request time, since
* secrets are only available during the request lifecycle on Cloudflare.
* Falls back to useRuntimeConfig() for local dev / non-CF deployments.
*/
function getAccountsApiCredentials(event) {
	const cfEnv = event.context?.cloudflare?.env ?? event.req?.runtime?.cloudflare?.env;
	const apiKey = cfEnv?.ACCOUNTS_API_KEY ?? cfEnv?.NUXT_ACCOUNTS_API_KEY ?? process.env.ACCOUNTS_API_KEY ?? process.env.NUXT_ACCOUNTS_API_KEY ?? useRuntimeConfig().accountsApiKey ?? "";
	const url = cfEnv?.ACCOUNTS_API_URL ?? cfEnv?.NUXT_ACCOUNTS_API_URL ?? process.env.ACCOUNTS_API_URL ?? process.env.NUXT_ACCOUNTS_API_URL ?? useRuntimeConfig().accountsApiUrl ?? "https://accounts.betterseqta.org";
	return {
		apiKey: String(apiKey || "").trim(),
		url: String(url || "https://accounts.betterseqta.org").replace(/\/$/, "")
	};
}
//#endregion
export { getAccountsApiCredentials as t };
