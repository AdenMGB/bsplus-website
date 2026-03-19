import * as server from '../entries/pages/download/_page.server.ts.js';

export const index = 23;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/download/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/download/+page.server.ts";
export const imports = ["_app/immutable/nodes/23.DNA1Uw1l.js","_app/immutable/chunks/xryEiWxZ.js","_app/immutable/chunks/iW-43lro.js","_app/immutable/chunks/f23f8hhM.js","_app/immutable/chunks/DxC_eKjn.js","_app/immutable/chunks/C63yIh5J.js","_app/immutable/chunks/BFCEXOfG.js","_app/immutable/chunks/Co5gBqqb.js"];
export const stylesheets = [];
export const fonts = [];
