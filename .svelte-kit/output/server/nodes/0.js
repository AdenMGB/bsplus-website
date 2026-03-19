import * as server from '../entries/pages/_layout.server.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { server };
export const server_id = "src/routes/+layout.server.ts";
export const imports = ["_app/immutable/nodes/0.D5yVe-jW.js","_app/immutable/chunks/xryEiWxZ.js","_app/immutable/chunks/BsEnv9iQ.js","_app/immutable/chunks/iW-43lro.js","_app/immutable/chunks/BqUmr9gf.js","_app/immutable/chunks/f23f8hhM.js","_app/immutable/chunks/DxC_eKjn.js","_app/immutable/chunks/C63yIh5J.js"];
export const stylesheets = ["_app/immutable/assets/0.wXRaB2H9.css"];
export const fonts = [];
