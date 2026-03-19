import * as server from '../entries/pages/minecraft/_page.server.ts.js';

export const index = 24;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/minecraft/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/minecraft/+page.server.ts";
export const imports = ["_app/immutable/nodes/24.BjOuRglC.js","_app/immutable/chunks/xryEiWxZ.js","_app/immutable/chunks/f23f8hhM.js","_app/immutable/chunks/DxC_eKjn.js","_app/immutable/chunks/C63yIh5J.js","_app/immutable/chunks/BFCEXOfG.js"];
export const stylesheets = [];
export const fonts = [];
