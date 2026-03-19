import * as server from '../entries/pages/comparison/_page.server.ts.js';

export const index = 21;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/comparison/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/comparison/+page.server.ts";
export const imports = ["_app/immutable/nodes/21.DSiV4rmk.js","_app/immutable/chunks/xryEiWxZ.js","_app/immutable/chunks/f23f8hhM.js","_app/immutable/chunks/DxC_eKjn.js","_app/immutable/chunks/BFCEXOfG.js","_app/immutable/chunks/Co5gBqqb.js"];
export const stylesheets = [];
export const fonts = [];
