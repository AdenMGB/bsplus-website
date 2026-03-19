import { t as getAccountsApiCredentials } from "./accounts.js";
import { getHeader } from "h3";
//#region server/api/analytics/accounts.get.ts
/**
* Accounts analytics - admin only.
* Proxies to accounts.betterseqta.org export API.
* Requires ACCOUNTS_API_KEY in env (Cloudflare: set via wrangler secret or [vars]).
*/
async function fetchAccountsApi(path, credentials) {
	const { apiKey, url } = credentials;
	if (!apiKey) return {
		error: "ACCOUNTS_API_KEY not configured",
		total: null,
		count: null
	};
	try {
		return {
			...await $fetch(`${url}/api/export${path}`, { headers: {
				Authorization: `Bearer ${apiKey}`,
				"X-API-Key": apiKey
			} }),
			error: null
		};
	} catch (e) {
		const err = e;
		return {
			error: err?.data?.error || err?.message || "Failed to fetch",
			total: null,
			count: null
		};
	}
}
var accounts_get_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	const credentials = getAccountsApiCredentials(event);
	const [usersCount, reservedClients] = await Promise.all([fetchAccountsApi("/users/count", credentials), fetchAccountsApi("/reserved-clients", credentials)]);
	return {
		users: {
			total: usersCount.total ?? null,
			error: usersCount.error
		},
		reservedClients: {
			count: reservedClients.count ?? null,
			error: reservedClients.error
		}
	};
});
//#endregion
export { accounts_get_default as default };
