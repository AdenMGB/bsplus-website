export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set(["apple-touch-icon.png","favicon-96x96.png","favicon.ico","favicon.svg","fonts/helvetica/helvetica-300-light.woff2","fonts/helvetica/Helvetica-400-italic.woff","fonts/helvetica/Helvetica-400.woff","fonts/helvetica/Helvetica-600-bold-italic.woff","fonts/helvetica/Helvetica-600-bold.woff","fonts/helvetica/helvetica-compressed-5871d14b6903a.woff","fonts/helvetica/helvetica-light-587ebe5a59211.woff","fonts/helvetica/helvetica-rounded-bold-5871d05ead8de.woff","fonts/inter/Inter-variable-400-italic.ttf","fonts/inter/Inter-variable-400.ttf","fonts/motiva/motiva-sans-100-thin.ttf","fonts/motiva/motiva-sans-300-light.woff.ttf","fonts/motiva/motiva-sans-400-regular.woff.ttf","fonts/motiva/motiva-sans-500-medium.woff.ttf","fonts/motiva/motiva-sans-600-bold.woff.ttf","fonts/motiva/motiva-sans-700-extra-bold.ttf","fonts/motiva/motiva-sans-900-black.woff.ttf","images/2025-06-09 09-51-43.mp4","images/2025_06_06_12_32_38.mp4","images/404.jpg","images/8.png","images/carousel/hl.png","images/carousel/hzd.png","images/carousel/mobile/hl.png","images/carousel/mobile/hzd.png","images/carousel/mobile/store.png","images/carousel/store.png","images/proton.webp","images/screenshots/Assements1.jpeg","images/screenshots/Assements2.jpeg","images/screenshots/Dashboard.jpeg","images/screenshots/Homepage.jpeg","images/screenshots/login.jpeg","images/screenshots/timetable.png","images/ss/assements.png","images/ss/courses.png","images/ss/dashboard.png","images/ss/homepage.png","images/ss/message_inbox.png","images/ss/message_viewing.png","images/ss/news.png","images/ss/notices.png","images/ss/reports.png","images/ss/settings.png","images/updates.png","site.webmanifest","web-app-manifest-192x192.png","web-app-manifest-512x512.png"]),
	mimeTypes: {".png":"image/png",".svg":"image/svg+xml",".woff2":"font/woff2",".woff":"font/woff",".ttf":"font/ttf",".mp4":"video/mp4",".jpg":"image/jpeg",".webp":"image/webp",".jpeg":"image/jpeg",".webmanifest":"application/manifest+json"},
	_: {
		client: {start:"_app/immutable/entry/start.CHXNOrd8.js",app:"_app/immutable/entry/app.C8Y0462y.js",imports:["_app/immutable/entry/start.CHXNOrd8.js","_app/immutable/chunks/xryEiWxZ.js","_app/immutable/chunks/BsEnv9iQ.js","_app/immutable/entry/app.C8Y0462y.js","_app/immutable/chunks/xryEiWxZ.js","_app/immutable/chunks/DOiM1DqK.js","_app/immutable/chunks/f23f8hhM.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js')),
			__memo(() => import('./nodes/14.js')),
			__memo(() => import('./nodes/15.js')),
			__memo(() => import('./nodes/16.js')),
			__memo(() => import('./nodes/17.js')),
			__memo(() => import('./nodes/18.js')),
			__memo(() => import('./nodes/19.js')),
			__memo(() => import('./nodes/20.js')),
			__memo(() => import('./nodes/21.js')),
			__memo(() => import('./nodes/22.js')),
			__memo(() => import('./nodes/23.js')),
			__memo(() => import('./nodes/24.js')),
			__memo(() => import('./nodes/25.js')),
			__memo(() => import('./nodes/26.js')),
			__memo(() => import('./nodes/27.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/admin",
				pattern: /^\/admin\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/admin/analytics",
				pattern: /^\/admin\/analytics\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/admin/collections",
				pattern: /^\/admin\/collections\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/admin/collections/new",
				pattern: /^\/admin\/collections\/new\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/admin/collections/[id]",
				pattern: /^\/admin\/collections\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/admin/news",
				pattern: /^\/admin\/news\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/admin/news/create",
				pattern: /^\/admin\/news\/create\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/admin/news/edit/[slug]",
				pattern: /^\/admin\/news\/edit\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/admin/questionnaire",
				pattern: /^\/admin\/questionnaire\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/admin/questionnaire/create",
				pattern: /^\/admin\/questionnaire\/create\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/admin/questionnaire/edit/[id]",
				pattern: /^\/admin\/questionnaire\/edit\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/admin/themes",
				pattern: /^\/admin\/themes\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/admin/themes/upload",
				pattern: /^\/admin\/themes\/upload\/?$/,
				params: [],
				page: { layouts: [0,2,], errors: [1,,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/admin/themes/[id]",
				pattern: /^\/admin\/themes\/([^/]+?)\/?$/,
				params: [{"name":"id","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,2,], errors: [1,,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/api/[...path]",
				pattern: /^\/api(?:\/([^]*))?\/?$/,
				params: [{"name":"path","optional":false,"rest":true,"chained":true}],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/api/_...path_/_server.ts.js'))
			},
			{
				id: "/changelogs",
				pattern: /^\/changelogs\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/changelogs/bqplus",
				pattern: /^\/changelogs\/bqplus\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/changelogs/desqta",
				pattern: /^\/changelogs\/desqta\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/comparison",
				pattern: /^\/comparison\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/desqta",
				pattern: /^\/desqta\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/download",
				pattern: /^\/download\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/minecraft",
				pattern: /^\/minecraft\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/news",
				pattern: /^\/news\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/news/[slug]",
				pattern: /^\/news\/([^/]+?)\/?$/,
				params: [{"name":"slug","optional":false,"rest":false,"chained":false}],
				page: { layouts: [0,], errors: [1,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/privacy",
				pattern: /^\/privacy\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/robots.txt",
				pattern: /^\/robots\.txt\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/robots.txt/_server.ts.js'))
			},
			{
				id: "/sitemap.xml",
				pattern: /^\/sitemap\.xml\/?$/,
				params: [],
				page: null,
				endpoint: __memo(() => import('./entries/endpoints/sitemap.xml/_server.ts.js'))
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
