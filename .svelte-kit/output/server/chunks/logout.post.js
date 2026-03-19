//#region server/api/auth/logout.post.ts
var logout_post_default = defineEventHandler((event) => {
	deleteCookie(event, "auth_token");
	return { success: true };
});
//#endregion
export { logout_post_default as default };
