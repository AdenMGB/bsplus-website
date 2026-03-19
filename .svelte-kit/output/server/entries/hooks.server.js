import { t as getUserFromRequest } from "../chunks/auth.js";
//#region src/hooks.server.ts
var handle = async ({ event, resolve }) => {
	event.locals.user = await getUserFromRequest(event);
	return resolve(event);
};
//#endregion
export { handle };
