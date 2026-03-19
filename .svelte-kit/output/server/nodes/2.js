import * as server from '../entries/pages/admin/_layout.server.ts.js';

export const index = 2;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/admin/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/admin/+layout.server.ts";
export const imports = ["_app/immutable/nodes/2.Bx3oi3LE.js","_app/immutable/chunks/xryEiWxZ.js","_app/immutable/chunks/BsEnv9iQ.js","_app/immutable/chunks/BqUmr9gf.js","_app/immutable/chunks/f23f8hhM.js"];
export const stylesheets = [];
export const fonts = [];
