import { t as getDB } from "./db.js";
import { t as getOptionalUser } from "./auth2.js";
//#region server/api/themes/[id]/rating.post.ts
var rating_post_default = defineEventHandler(async (event) => {
	const db = getDB(event);
	const id = getRouterParam(event, "id");
	const user = await getOptionalUser(event);
	const body = await readBody(event);
	if (!user) throw createError({
		statusCode: 401,
		statusMessage: "Authentication required"
	});
	if (!id) throw createError({
		statusCode: 400,
		statusMessage: "Theme ID is required"
	});
	if (!body.rating || body.rating < 1 || body.rating > 5) throw createError({
		statusCode: 400,
		statusMessage: "Rating must be between 1 and 5"
	});
	if (!await db.prepare("SELECT id FROM themes WHERE id = ? AND status = ?").bind(id, "approved").first()) throw createError({
		statusCode: 404,
		statusMessage: "Theme not found"
	});
	const existingRating = await db.prepare("SELECT id, rating FROM theme_ratings WHERE user_id = ? AND theme_id = ?").bind(user.id, id).first();
	const now = Date.now();
	let ratingId;
	if (existingRating) {
		ratingId = existingRating.id;
		await db.prepare("UPDATE theme_ratings SET rating = ?, comment = ?, updated_at = ? WHERE id = ?").bind(body.rating, body.comment || null, now, ratingId).run();
		existingRating.rating;
		const ratingsResult = await db.prepare("SELECT AVG(rating) as avg, COUNT(*) as count FROM theme_ratings WHERE theme_id = ?").bind(id).first();
		await db.prepare("UPDATE themes SET rating_average = ?, rating_count = ? WHERE id = ?").bind(ratingsResult?.avg || 0, ratingsResult?.count || 0, id).run();
	} else {
		ratingId = crypto.randomUUID();
		await db.prepare("INSERT INTO theme_ratings (id, user_id, theme_id, rating, comment, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)").bind(ratingId, user.id, id, body.rating, body.comment || null, now, now).run();
		const ratingsResult = await db.prepare("SELECT AVG(rating) as avg, COUNT(*) as count FROM theme_ratings WHERE theme_id = ?").bind(id).first();
		await db.prepare("UPDATE themes SET rating_average = ?, rating_count = ? WHERE id = ?").bind(ratingsResult?.avg || 0, ratingsResult?.count || 0, id).run();
	}
	const updatedTheme = await db.prepare("SELECT rating_average, rating_count FROM themes WHERE id = ?").bind(id).first();
	return {
		success: true,
		data: {
			rating: {
				id: ratingId,
				rating: body.rating,
				comment: body.comment || null,
				created_at: now
			},
			theme_rating_average: updatedTheme?.rating_average || 0,
			theme_rating_count: updatedTheme?.rating_count || 0
		},
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
});
//#endregion
export { rating_post_default as default };
