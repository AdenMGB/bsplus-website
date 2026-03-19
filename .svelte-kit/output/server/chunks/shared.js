import { HttpError, SvelteKitError } from "@sveltejs/kit/internal";
import * as devalue from "devalue";
//#region node_modules/.pnpm/@sveltejs+kit@2.55.0_@svelt_9206d0454335c2801330f2367153ad81/node_modules/@sveltejs/kit/src/runtime/utils.js
var text_encoder = new TextEncoder();
var text_decoder = new TextDecoder();
/**
* Like node's path.relative, but without using node
* @param {string} from
* @param {string} to
*/
function get_relative_path(from, to) {
	const from_parts = from.split(/[/\\]/);
	const to_parts = to.split(/[/\\]/);
	from_parts.pop();
	while (from_parts[0] === to_parts[0]) {
		from_parts.shift();
		to_parts.shift();
	}
	let i = from_parts.length;
	while (i--) from_parts[i] = "..";
	return from_parts.concat(to_parts).join("/");
}
/**
* @param {Uint8Array} bytes
* @returns {string}
*/
function base64_encode(bytes) {
	if (globalThis.Buffer) return globalThis.Buffer.from(bytes).toString("base64");
	let binary = "";
	for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
	return btoa(binary);
}
/**
* @param {string} encoded
* @returns {Uint8Array}
*/
function base64_decode(encoded) {
	if (globalThis.Buffer) {
		const buffer = globalThis.Buffer.from(encoded, "base64");
		return new Uint8Array(buffer);
	}
	const binary = atob(encoded);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
	return bytes;
}
//#endregion
//#region node_modules/.pnpm/@sveltejs+kit@2.55.0_@svelt_9206d0454335c2801330f2367153ad81/node_modules/@sveltejs/kit/src/utils/error.js
/**
* @param {unknown} err
* @return {Error}
*/
function coalesce_to_error(err) {
	return err instanceof Error || err && err.name && err.message ? err : new Error(JSON.stringify(err));
}
/**
* This is an identity function that exists to make TypeScript less
* paranoid about people throwing things that aren't errors, which
* frankly is not something we should care about
* @param {unknown} error
*/
function normalize_error(error) {
	return error;
}
/**
* @param {unknown} error
*/
function get_status(error) {
	return error instanceof HttpError || error instanceof SvelteKitError ? error.status : 500;
}
/**
* @param {unknown} error
*/
function get_message(error) {
	return error instanceof SvelteKitError ? error.text : "Internal Error";
}
//#endregion
//#region node_modules/.pnpm/@sveltejs+kit@2.55.0_@svelt_9206d0454335c2801330f2367153ad81/node_modules/@sveltejs/kit/src/runtime/shared.js
/** @import { Transport } from '@sveltejs/kit' */
/**
* @param {string} route_id
* @param {string} dep
*/
function validate_depends(route_id, dep) {
	const match = /^(moz-icon|view-source|jar):/.exec(dep);
	if (match) console.warn(`${route_id}: Calling \`depends('${dep}')\` will throw an error in Firefox because \`${match[1]}\` is a special URI scheme`);
}
var INVALIDATED_PARAM = "x-sveltekit-invalidated";
var TRAILING_SLASH_PARAM = "x-sveltekit-trailing-slash";
/**
* @param {any} data
* @param {string} [location_description]
*/
function validate_load_response(data, location_description) {
	if (data != null && Object.getPrototypeOf(data) !== Object.prototype) throw new Error(`a load function ${location_description} returned ${typeof data !== "object" ? `a ${typeof data}` : data instanceof Response ? "a Response object" : Array.isArray(data) ? "an array" : "a non-plain object"}, but must return a plain object at the top level (i.e. \`return {...}\`)`);
}
/**
* Try to `devalue.stringify` the data object using the provided transport encoders.
* @param {any} data
* @param {Transport} transport
*/
function stringify(data, transport) {
	const encoders = Object.fromEntries(Object.entries(transport).map(([k, v]) => [k, v.encode]));
	return devalue.stringify(data, encoders);
}
/**
* Stringifies the argument (if any) for a remote function in such a way that
* it is both a valid URL and a valid file name (necessary for prerendering).
* @param {any} value
* @param {Transport} transport
*/
function stringify_remote_arg(value, transport) {
	if (value === void 0) return "";
	const json_string = stringify(value, transport);
	return base64_encode(new TextEncoder().encode(json_string)).replaceAll("=", "").replaceAll("+", "-").replaceAll("/", "_");
}
/**
* Parses the argument (if any) for a remote function
* @param {string} string
* @param {Transport} transport
*/
function parse_remote_arg(string, transport) {
	if (!string) return void 0;
	const json_string = text_decoder.decode(base64_decode(string.replaceAll("-", "+").replaceAll("_", "/")));
	const decoders = Object.fromEntries(Object.entries(transport).map(([k, v]) => [k, v.decode]));
	return devalue.parse(json_string, decoders);
}
/**
* @param {string} id
* @param {string} payload
*/
function create_remote_key(id, payload) {
	return id + "/" + payload;
}
//#endregion
export { stringify as a, validate_load_response as c, get_status as d, normalize_error as f, text_encoder as g, text_decoder as h, parse_remote_arg as i, coalesce_to_error as l, get_relative_path as m, TRAILING_SLASH_PARAM as n, stringify_remote_arg as o, base64_encode as p, create_remote_key as r, validate_depends as s, INVALIDATED_PARAM as t, get_message as u };
