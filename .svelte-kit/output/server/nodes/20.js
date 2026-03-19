import * as server from '../entries/pages/changelogs/desqta/_page.server.ts.js';

export const index = 20;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/changelogs/desqta/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/changelogs/desqta/+page.server.ts";
export const imports = ["_app/immutable/nodes/20.D1unoMJC.js","_app/immutable/chunks/xryEiWxZ.js","_app/immutable/chunks/f23f8hhM.js","_app/immutable/chunks/BFCEXOfG.js"];
export const stylesheets = [];
export const fonts = [];
