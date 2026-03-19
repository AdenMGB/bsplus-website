import { t as getDB } from "./db.js";
import { n as requireAdmin } from "./auth2.js";
//#region server/api/admin/themes/index.get.ts
var SORT_COLUMNS = {
	created_at: "t.created_at",
	updated_at: "t.updated_at",
	download_count: "t.download_count",
	rating_average: "t.rating_average",
	name: "t.name"
};
var index_get_default = defineEventHandler(async (event) => {
	await requireAdmin(event);
	const db = getDB(event);
	const query = getQuery(event);
	const page = parseInt(query.page || "1", 10);
	const limit = Math.min(parseInt(query.limit || "20", 10), 100);
	const offset = (page - 1) * limit;
	const status = query.status;
	const search = query.search;
	const type = query.type;
	const category = query.category;
	const sortBy = SORT_COLUMNS[query.sort || ""] || "t.created_at";
	const sortOrder = query.order === "asc" ? "ASC" : "DESC";
	const params = [];
	const conditions = [];
	if (type === "betterseqta" || type === "desqta") {
		conditions.push("t.theme_type = ?");
		params.push(type);
	}
	if (status) {
		conditions.push("t.status = ?");
		params.push(status);
	}
	if (search) {
		conditions.push("(t.name LIKE ? OR t.description LIKE ? OR t.author LIKE ?)");
		const searchPattern = `%${search}%`;
		params.push(searchPattern, searchPattern, searchPattern);
	}
	if (category) {
		conditions.push("t.category = ?");
		params.push(category);
	}
	const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
	const total = (await db.prepare(`SELECT COUNT(*) as total FROM themes t ${whereClause}`).bind(...params).first())?.total || 0;
	const totalPages = Math.ceil(total / limit);
	return {
		success: true,
		data: {
			themes: (await db.prepare(`SELECT t.*, ts.submission_notes, ts.reviewed_by, ts.reviewed_at, ts.rejection_reason 
     FROM themes t
     LEFT JOIN theme_submissions ts ON t.id = ts.theme_id
     ${whereClause}
     ORDER BY ${sortBy} ${sortOrder}
     LIMIT ? OFFSET ?`).bind(...params, limit, offset).all()).results.map((theme) => ({
				id: theme.id,
				name: theme.name,
				slug: theme.slug,
				version: theme.version,
				description: theme.description,
				author: theme.author,
				license: theme.license,
				category: theme.category,
				tags: theme.tags ? JSON.parse(theme.tags) : [],
				status: theme.status,
				featured: Boolean(theme.featured),
				download_count: theme.download_count,
				favorite_count: theme.favorite_count,
				rating_average: theme.rating_average,
				rating_count: theme.rating_count,
				compatibility: {
					min: theme.compatibility_min,
					max: theme.compatibility_max || void 0
				},
				preview: {
					thumbnail: theme.preview_thumbnail_url || theme.cover_image_url,
					screenshots: theme.preview_screenshots ? JSON.parse(theme.preview_screenshots) : []
				},
				preview_thumbnail_url: theme.preview_thumbnail_url || theme.cover_image_url,
				theme_type: theme.theme_type || "desqta",
				zip_download_url: theme.zip_download_url,
				theme_json_url: theme.theme_json_url,
				cover_image_url: theme.cover_image_url,
				marquee_image_url: theme.marquee_image_url,
				file_size: theme.file_size,
				checksum: theme.checksum,
				created_at: theme.created_at,
				updated_at: theme.updated_at,
				published_at: theme.published_at,
				submission_notes: theme.submission_notes,
				reviewed_by: theme.reviewed_by,
				reviewed_at: theme.reviewed_at,
				rejection_reason: theme.rejection_reason
			})),
			pagination: {
				page,
				limit,
				total,
				total_pages: totalPages,
				has_next: page < totalPages,
				has_prev: page > 1
			}
		},
		error: null,
		meta: {
			timestamp: Date.now(),
			version: "1.0.0"
		}
	};
});
//#endregion
export { index_get_default as default };
