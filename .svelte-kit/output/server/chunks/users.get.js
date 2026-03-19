import { t as getAccountsApiCredentials } from "./accounts.js";
import { getHeader } from "h3";
//#region server/api/analytics/accounts/users.get.ts
/**
* Accounts users analytics - admin only.
* Fetches full user list from accounts.betterseqta.org and computes:
* - Signups over time (daily)
* - Cumulative signups
* - Top email domains
* Cloudflare: ACCOUNTS_API_KEY from wrangler secret or [vars].
*/
function extractEmailDomain(email) {
	if (!email || typeof email !== "string") return "(no email)";
	const at = email.indexOf("@");
	if (at === -1) return "(invalid)";
	return email.slice(at + 1).toLowerCase().trim() || "(empty)";
}
function getCreatedAtDate(u) {
	const ts = u.created_at;
	if (typeof ts === "number" && ts > 0) return /* @__PURE__ */ new Date(ts * 1e3);
	const str = u.createdAt;
	if (typeof str === "string") {
		const d = new Date(str);
		if (!isNaN(d.getTime())) return d;
	}
	return null;
}
var users_get_default = defineEventHandler(async (event) => {
	const user = await $fetch("/api/auth/me", { headers: { cookie: getHeader(event, "cookie") || "" } }).catch(() => null);
	if (!user || !user.admin_level || user.admin_level < 1) throw createError({
		statusCode: 403,
		message: "Forbidden"
	});
	const daysParam = getQuery(event).days;
	const days = daysParam === "all" || daysParam === "0" || daysParam === "" || typeof daysParam === "string" && daysParam.toLowerCase() === "all" ? null : Math.min(Math.max(Number(daysParam) || 30, 1), 365);
	const cutoffMs = days != null ? Date.now() - days * 86400 * 1e3 : 0;
	const { apiKey, url: baseUrl } = getAccountsApiCredentials(event);
	if (!apiKey) return {
		error: "ACCOUNTS_API_KEY not configured",
		total: null,
		signupsOverTime: [],
		topDomains: [],
		adminCount: null
	};
	try {
		let users = (await $fetch(`${baseUrl}/api/export/users/full`, { headers: {
			Authorization: `Bearer ${apiKey}`,
			"X-API-Key": apiKey
		} }))?.users || [];
		if (days != null) users = users.filter((u) => {
			const date = getCreatedAtDate(u);
			return date && date.getTime() >= cutoffMs;
		});
		const total = users.length;
		const dailyMap = /* @__PURE__ */ new Map();
		for (const u of users) {
			const date = getCreatedAtDate(u);
			if (!date) continue;
			const key = date.toISOString().slice(0, 10);
			dailyMap.set(key, (dailyMap.get(key) || 0) + 1);
		}
		const sortedDates = [...dailyMap.keys()].sort();
		let cumulative = 0;
		const signupsOverTime = sortedDates.map((dateStr) => {
			const daily = dailyMap.get(dateStr) || 0;
			cumulative += daily;
			return {
				date: dateStr,
				timestamp: Math.floor((/* @__PURE__ */ new Date(dateStr + "T12:00:00Z")).getTime() / 1e3),
				daily_signups: daily,
				cumulative_signups: cumulative
			};
		});
		const domainCount = /* @__PURE__ */ new Map();
		for (const u of users) {
			const domain = extractEmailDomain(u.email);
			domainCount.set(domain, (domainCount.get(domain) || 0) + 1);
		}
		return {
			error: null,
			total,
			signupsOverTime,
			topDomains: [...domainCount.entries()].map(([domain, count]) => ({
				domain,
				count
			})).sort((a, b) => b.count - a.count).slice(0, 15),
			adminCount: users.filter((u) => (u.admin_level ?? 0) > 0 || (u.is_admin ?? 0) > 0).length
		};
	} catch (e) {
		const err = e;
		return {
			error: err?.data?.error || err?.message || "Failed to fetch users",
			total: null,
			signupsOverTime: [],
			topDomains: [],
			adminCount: null
		};
	}
});
//#endregion
export { users_get_default as default };
