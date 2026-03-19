import { error, json } from "@sveltejs/kit";
import { AsyncLocalStorage } from "node:async_hooks";
//#region src/lib/server/nitro-compat.ts
var store = new AsyncLocalStorage();
var modules = /* @__PURE__ */ Object.assign({
	"/server/api/__sitemap__/urls.ts": () => import("../../../../chunks/urls.js"),
	"/server/api/admin/collections/[id].delete.ts": () => import("../../../../chunks/_id_.delete.js"),
	"/server/api/admin/collections/[id].put.ts": () => import("../../../../chunks/_id_.put.js"),
	"/server/api/admin/collections/index.get.ts": () => import("../../../../chunks/index.get.js"),
	"/server/api/admin/collections/index.post.ts": () => import("../../../../chunks/index.post.js"),
	"/server/api/admin/themes/[id]/approve.post.ts": () => import("../../../../chunks/approve.post.js"),
	"/server/api/admin/themes/[id]/reject.post.ts": () => import("../../../../chunks/reject.post.js"),
	"/server/api/admin/themes/[id]/update-files.post.ts": () => import("../../../../chunks/update-files.post.js"),
	"/server/api/admin/themes/[id].delete.ts": () => import("../../../../chunks/_id_2.delete.js"),
	"/server/api/admin/themes/[id].get.ts": () => import("../../../../chunks/_id_.get.js"),
	"/server/api/admin/themes/[id].put.ts": () => import("../../../../chunks/_id_2.put.js"),
	"/server/api/admin/themes/index.get.ts": () => import("../../../../chunks/index2.get.js"),
	"/server/api/admin/themes/index.post.ts": () => import("../../../../chunks/index2.post.js"),
	"/server/api/admin/themes/manifest-preview.post.ts": () => import("../../../../chunks/manifest-preview.post.js"),
	"/server/api/analytics/accounts/users.get.ts": () => import("../../../../chunks/users.get.js"),
	"/server/api/analytics/accounts.get.ts": () => import("../../../../chunks/accounts.get.js"),
	"/server/api/analytics/desqta.get.ts": () => import("../../../../chunks/desqta.get.js"),
	"/server/api/analytics/flush.post.ts": () => import("../../../../chunks/flush.post.js"),
	"/server/api/analytics/hourly-stats.get.ts": () => import("../../../../chunks/hourly-stats.get.js"),
	"/server/api/analytics/questionnaire.get.ts": () => import("../../../../chunks/questionnaire.get.js"),
	"/server/api/analytics/save-hourly-stats.ts": () => import("../../../../chunks/save-hourly-stats.js"),
	"/server/api/analytics/stats.get.ts": () => import("../../../../chunks/stats.get.js"),
	"/server/api/analytics/test-hourly-stats.get.ts": () => import("../../../../chunks/test-hourly-stats.get.js"),
	"/server/api/analytics/themes.get.ts": () => import("../../../../chunks/themes.get.js"),
	"/server/api/analytics/usage.get.ts": () => import("../../../../chunks/usage.get.js"),
	"/server/api/analytics/usage.post.ts": () => import("../../../../chunks/usage.post.js"),
	"/server/api/auth/callback.get.ts": () => import("../../../../chunks/callback.get.js"),
	"/server/api/auth/extension/login.post.ts": () => import("../../../../chunks/login.post.js"),
	"/server/api/auth/login.get.ts": () => import("../../../../chunks/login.get.js"),
	"/server/api/auth/logout.post.ts": () => import("../../../../chunks/logout.post.js"),
	"/server/api/auth/me.get.ts": () => import("../../../../chunks/me.get.js"),
	"/server/api/changelogs/bqplus.get.ts": () => import("../../../../chunks/bqplus.get.js"),
	"/server/api/changelogs/desqta.get.ts": () => import("../../../../chunks/desqta2.get.js"),
	"/server/api/collections/[id].get.ts": () => import("../../../../chunks/_id_2.get.js"),
	"/server/api/collections/index.get.ts": () => import("../../../../chunks/index3.get.js"),
	"/server/api/images/[...path].get.ts": () => import("../../../../chunks/_...path_.get.js"),
	"/server/api/images/themes/[id]/[filename].get.ts": () => import("../../../../chunks/_filename_.get.js"),
	"/server/api/news/[id].delete.ts": () => import("../../../../chunks/_id_3.delete.js"),
	"/server/api/news/[slug].get.ts": () => import("../../../../chunks/_slug_.get.js"),
	"/server/api/news/[slug].put.ts": () => import("../../../../chunks/_slug_.put.js"),
	"/server/api/news/index.get.ts": () => import("../../../../chunks/index4.get.js"),
	"/server/api/news/index.post.ts": () => import("../../../../chunks/index3.post.js"),
	"/server/api/news/preview.post.ts": () => import("../../../../chunks/preview.post.js"),
	"/server/api/news/publish.patch.ts": () => import("../../../../chunks/publish.patch.js"),
	"/server/api/policy/privacy.get.ts": () => import("../../../../chunks/privacy.get.js"),
	"/server/api/questionnaire/[id].delete.ts": () => import("../../../../chunks/_id_4.delete.js"),
	"/server/api/questionnaire/[id].get.ts": () => import("../../../../chunks/_id_3.get.js"),
	"/server/api/questionnaire/[id].put.ts": () => import("../../../../chunks/_id_3.put.js"),
	"/server/api/questionnaire/cleanup-images.post.ts": () => import("../../../../chunks/cleanup-images.post.js"),
	"/server/api/questionnaire/create.post.ts": () => import("../../../../chunks/create.post.js"),
	"/server/api/questionnaire/current.get.ts": () => import("../../../../chunks/current.get.js"),
	"/server/api/questionnaire/has-voted.get.ts": () => import("../../../../chunks/has-voted.get.js"),
	"/server/api/questionnaire/index.get.ts": () => import("../../../../chunks/index5.get.js"),
	"/server/api/questionnaire/reorder.post.ts": () => import("../../../../chunks/reorder.post.js"),
	"/server/api/questionnaire/results.get.ts": () => import("../../../../chunks/results.get.js"),
	"/server/api/questionnaire/sync-votes.post.ts": () => import("../../../../chunks/sync-votes.post.js"),
	"/server/api/questionnaire/vote.post.ts": () => import("../../../../chunks/vote.post.js"),
	"/server/api/themes/[id]/download.get.ts": () => import("../../../../chunks/download.get.js"),
	"/server/api/themes/[id]/favorite.delete.ts": () => import("../../../../chunks/favorite.delete.js"),
	"/server/api/themes/[id]/favorite.post.ts": () => import("../../../../chunks/favorite.post.js"),
	"/server/api/themes/[id]/rating.post.ts": () => import("../../../../chunks/rating.post.js"),
	"/server/api/themes/[id]/theme.json.get.ts": () => import("../../../../chunks/theme.json.get.js"),
	"/server/api/themes/[id]/user-status.get.ts": () => import("../../../../chunks/user-status.get.js"),
	"/server/api/themes/[id].get.ts": () => import("../../../../chunks/_id_4.get.js"),
	"/server/api/themes/favorites.get.ts": () => import("../../../../chunks/favorites.get.js"),
	"/server/api/themes/index.get.ts": () => import("../../../../chunks/index6.get.js"),
	"/server/api/themes/recalculate-stats.post.ts": () => import("../../../../chunks/recalculate-stats.post.js"),
	"/server/api/themes/search.get.ts": () => import("../../../../chunks/search.get.js"),
	"/server/api/themes/spotlight.get.ts": () => import("../../../../chunks/spotlight.get.js"),
	"/server/api/upload.post.ts": () => import("../../../../chunks/upload.post.js")
});
var routes = Object.entries(modules).map(([key, loader]) => createRoute(key, loader)).filter((route) => Boolean(route)).sort((a, b) => scoreRoute(b) - scoreRoute(a));
function createRoute(key, loader) {
	const match = key.replace("/server/api/", "").replace(/\.ts$/, "").match(/^(.*?)(?:\.(get|post|put|patch|delete|options|head))?$/i);
	if (!match) return null;
	const [, rawPath, rawMethod] = match;
	if (!rawMethod) return null;
	const segments = rawPath.split("/").filter(Boolean);
	if (segments.at(-1) === "index") segments.pop();
	return {
		key,
		method: rawMethod.toUpperCase(),
		segments,
		loader
	};
}
function scoreRoute(route) {
	return route.segments.reduce((score, segment) => {
		if (segment.startsWith("[...")) return score + 1;
		if (segment.startsWith("[")) return score + 2;
		return score + 4;
	}, 0);
}
function createRuntimeConfig(event) {
	const env = event.platform?.env;
	const origin = event.url.origin || "https://betterseqta.org";
	return {
		oauthClientId: env?.NUXT_OAUTH_CLIENT_ID ?? env?.OAUTH_CLIENT_ID ?? process.env.NUXT_OAUTH_CLIENT_ID ?? "",
		oauthClientSecret: env?.NUXT_OAUTH_CLIENT_SECRET ?? env?.OAUTH_CLIENT_SECRET ?? process.env.NUXT_OAUTH_CLIENT_SECRET ?? "",
		oauthRedirectUri: env?.NUXT_OAUTH_REDIRECT_URI ?? env?.OAUTH_REDIRECT_URI ?? process.env.NUXT_OAUTH_REDIRECT_URI ?? `${origin}/api/auth/callback`,
		accountsApiKey: env?.ACCOUNTS_API_KEY ?? env?.NUXT_ACCOUNTS_API_KEY ?? process.env.ACCOUNTS_API_KEY ?? process.env.NUXT_ACCOUNTS_API_KEY ?? "",
		accountsApiUrl: env?.ACCOUNTS_API_URL ?? env?.NUXT_ACCOUNTS_API_URL ?? process.env.ACCOUNTS_API_URL ?? process.env.NUXT_ACCOUNTS_API_URL ?? "https://accounts.betterseqta.org",
		public: { siteUrl: env?.PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL ?? "https://betterseqta.org" }
	};
}
function parseCookies(cookieHeader) {
	const cookies = /* @__PURE__ */ new Map();
	if (!cookieHeader) return cookies;
	for (const part of cookieHeader.split(/;\s*/)) {
		const [name, ...valueParts] = part.split("=");
		if (!name) continue;
		cookies.set(name, decodeURIComponent(valueParts.join("=")));
	}
	return cookies;
}
function serializeCookie(name, value, options = {}) {
	const segments = [`${name}=${encodeURIComponent(value)}`];
	const path = options.path ?? "/";
	segments.push(`Path=${path}`);
	if (typeof options.maxAge === "number") segments.push(`Max-Age=${options.maxAge}`);
	if (options.httpOnly) segments.push("HttpOnly");
	if (options.secure) segments.push("Secure");
	if (typeof options.sameSite === "string") segments.push(`SameSite=${options.sameSite}`);
	if (typeof options.domain === "string") segments.push(`Domain=${options.domain}`);
	if (options.expires instanceof Date) segments.push(`Expires=${options.expires.toUTCString()}`);
	return segments.join("; ");
}
function createCompatEvent(event, params) {
	return {
		request: event.request,
		url: event.url,
		method: event.request.method,
		path: event.url.pathname,
		params,
		responseHeaders: new Headers(),
		context: {
			params,
			cloudflare: {
				env: event.platform?.env,
				cf: event.platform?.cf,
				ctx: event.platform?.ctx
			}
		},
		req: { runtime: { cloudflare: { env: event.platform?.env } } }
	};
}
function mergeHeaders(result, headers) {
	const merged = new Headers(result.headers);
	headers.forEach((value, key) => merged.append(key, value));
	return new Response(result.body, {
		status: result.status,
		statusText: result.statusText,
		headers: merged
	});
}
function toResponse(result, compatEvent) {
	if (result instanceof Response) return mergeHeaders(result, compatEvent.responseHeaders);
	if (result === void 0 || result === null) return new Response(null, { headers: compatEvent.responseHeaders });
	if (typeof result === "string" || result instanceof ArrayBuffer || result instanceof Uint8Array) {
		const body = result instanceof Uint8Array ? new Uint8Array(result).buffer : result;
		return new Response(body, { headers: compatEvent.responseHeaders });
	}
	return mergeHeaders(json(result), compatEvent.responseHeaders);
}
function normalizeError(err) {
	if (err instanceof Response) return err;
	if (err && typeof err === "object" && "statusCode" in err) {
		const status = Number(err.statusCode) || 500;
		const message = err.statusMessage ?? err.message ?? "Internal Server Error";
		return /* @__PURE__ */ new Error(`${status}:${message}`);
	}
	return err instanceof Error ? err : /* @__PURE__ */ new Error("Internal Server Error");
}
function matchRoute(method, path) {
	const segments = path.replace(/^\/api\/?/, "").split("/").filter(Boolean);
	for (const route of routes) {
		if (route.method !== method) continue;
		const params = {};
		let matched = true;
		let index = 0;
		for (; index < route.segments.length; index += 1) {
			const routeSegment = route.segments[index];
			const pathSegment = segments[index];
			if (routeSegment?.startsWith("[...") && routeSegment.endsWith("]")) {
				params[routeSegment.slice(4, -1)] = segments.slice(index).join("/");
				index = segments.length;
				break;
			}
			if (!pathSegment) {
				matched = false;
				break;
			}
			if (routeSegment.startsWith("[") && routeSegment.endsWith("]")) {
				params[routeSegment.slice(1, -1)] = pathSegment;
				continue;
			}
			if (routeSegment !== pathSegment) {
				matched = false;
				break;
			}
		}
		if (!matched) continue;
		if (index < segments.length && !route.segments.at(-1)?.startsWith("[...")) continue;
		return {
			route,
			params
		};
	}
	return null;
}
async function compatFetch(input, init) {
	const current = store.getStore();
	if (!current) return fetch(input, init);
	const requestInfo = input instanceof Request ? input : new Request(input, init);
	const isRelative = typeof input === "string" && input.startsWith("/");
	const requestInit = { ...init };
	const headers = new Headers(requestInit.headers ?? requestInfo.headers ?? {});
	const body = requestInit.body ?? (input instanceof Request ? input.body : void 0);
	if (body && typeof body === "object" && !(body instanceof FormData) && !(body instanceof URLSearchParams) && !(body instanceof Blob) && !(body instanceof ArrayBuffer) && !(body instanceof Uint8Array) && !(body instanceof ReadableStream)) {
		headers.set("content-type", headers.get("content-type") ?? "application/json");
		requestInit.body = JSON.stringify(body);
	} else if (body !== void 0) requestInit.body = body;
	requestInit.headers = headers;
	const response = isRelative ? await current.event.fetch(input, requestInit) : await fetch(input instanceof Request ? input : requestInfo, requestInit);
	const contentType = response.headers.get("content-type") ?? "";
	if (contentType.includes("application/json")) return response.json();
	if (contentType.startsWith("text/")) return response.text();
	return response.arrayBuffer();
}
function installGlobals() {
	const g = globalThis;
	if (g.__nitroCompatInstalled) return;
	g.__nitroCompatInstalled = true;
	g.defineEventHandler = (handler) => handler;
	g.defineSitemapEventHandler = (handler) => handler;
	g.getQuery = (event) => Object.fromEntries(event.url.searchParams.entries());
	g.getRouterParam = (event, name) => event.params[name];
	g.getHeader = (event, name) => event.request.headers.get(name) ?? void 0;
	g.getCookie = (event, name) => parseCookies(event.request.headers.get("cookie")).get(name);
	g.setCookie = (event, name, value, options) => {
		event.responseHeaders.append("set-cookie", serializeCookie(name, value, options));
	};
	g.deleteCookie = (event, name, options) => {
		event.responseHeaders.append("set-cookie", serializeCookie(name, "", {
			...options,
			expires: /* @__PURE__ */ new Date(0),
			maxAge: 0
		}));
	};
	g.setHeader = (event, name, value) => {
		event.responseHeaders.set(name, value);
	};
	g.send = (event, body, type = "text/plain") => {
		event.responseHeaders.set("content-type", type);
		return new Response(body, { headers: event.responseHeaders });
	};
	g.sendStream = (event, body) => new Response(body, { headers: event.responseHeaders });
	g.sendRedirect = (event, location, status = 302) => {
		event.responseHeaders.set("location", location);
		return new Response(null, {
			status,
			headers: event.responseHeaders
		});
	};
	g.createError = (details) => Object.assign(new Error(String(details.statusMessage ?? details.message ?? "Error")), details);
	g.readBody = async (event) => {
		if ((event.request.headers.get("content-type") ?? "").includes("application/json")) return event.request.json();
		const text = await event.request.text();
		try {
			return JSON.parse(text);
		} catch {
			return text;
		}
	};
	g.readMultipartFormData = async (event) => {
		const form = await event.request.formData();
		return await Promise.all(Array.from(form.entries()).map(async ([name, value]) => {
			if (typeof value === "string") return {
				name,
				data: new TextEncoder().encode(value)
			};
			return {
				name,
				filename: value.name,
				type: value.type,
				data: new Uint8Array(await value.arrayBuffer())
			};
		}));
	};
	g.useRuntimeConfig = () => {
		return store.getStore()?.runtimeConfig ?? createRuntimeConfig({ url: new URL("https://betterseqta.org") });
	};
	g.$fetch = compatFetch;
}
installGlobals();
async function handleCompatApi(event) {
	const match = matchRoute(event.request.method.toUpperCase(), event.url.pathname);
	if (!match) throw error(404, "API route not found");
	const module = await match.route.loader();
	if (!module.default) throw error(500, `API handler missing default export for ${match.route.key}`);
	const compatEvent = createCompatEvent(event, match.params);
	try {
		return toResponse(await store.run({
			event,
			compatEvent,
			runtimeConfig: createRuntimeConfig(event)
		}, async () => module.default(compatEvent)), compatEvent);
	} catch (err) {
		const normalized = normalizeError(err);
		if (normalized instanceof Response) return mergeHeaders(normalized, compatEvent.responseHeaders);
		const [statusPart, ...messageParts] = normalized.message.split(":");
		const parsedStatus = Number(statusPart);
		if (!Number.isNaN(parsedStatus) && messageParts.length > 0) throw error(parsedStatus, messageParts.join(":"));
		throw normalized;
	}
}
//#endregion
//#region src/routes/api/[...path]/+server.ts
var handler = async (event) => handleCompatApi(event);
var GET = handler;
var POST = handler;
var PUT = handler;
var PATCH = handler;
var DELETE = handler;
var OPTIONS = handler;
var HEAD = handler;
//#endregion
export { DELETE, GET, HEAD, OPTIONS, PATCH, POST, PUT };
