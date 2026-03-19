import * as server from '../entries/pages/news/_slug_/_page.server.ts.js';

export const index = 26;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/news/_slug_/_page.svelte.js')).default;
export { server };
export const server_id = "src/routes/news/[slug]/+page.server.ts";
export const imports = ["_app/immutable/nodes/26.DF1lTlMH.js","_app/immutable/chunks/xryEiWxZ.js","_app/immutable/chunks/f23f8hhM.js"];
export const stylesheets = [];
export const fonts = [];
