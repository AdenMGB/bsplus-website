
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/admin" | "/admin/analytics" | "/admin/collections" | "/admin/collections/new" | "/admin/collections/[id]" | "/admin/news" | "/admin/news/create" | "/admin/news/edit" | "/admin/news/edit/[slug]" | "/admin/questionnaire" | "/admin/questionnaire/create" | "/admin/questionnaire/edit" | "/admin/questionnaire/edit/[id]" | "/admin/themes" | "/admin/themes/upload" | "/admin/themes/[id]" | "/api" | "/api/[...path]" | "/changelogs" | "/changelogs/bqplus" | "/changelogs/desqta" | "/comparison" | "/desqta" | "/download" | "/minecraft" | "/news" | "/news/[slug]" | "/privacy" | "/robots.txt" | "/sitemap.xml";
		RouteParams(): {
			"/admin/collections/[id]": { id: string };
			"/admin/news/edit/[slug]": { slug: string };
			"/admin/questionnaire/edit/[id]": { id: string };
			"/admin/themes/[id]": { id: string };
			"/api/[...path]": { path: string };
			"/news/[slug]": { slug: string }
		};
		LayoutParams(): {
			"/": { id?: string; slug?: string; path?: string };
			"/admin": { id?: string; slug?: string };
			"/admin/analytics": Record<string, never>;
			"/admin/collections": { id?: string };
			"/admin/collections/new": Record<string, never>;
			"/admin/collections/[id]": { id: string };
			"/admin/news": { slug?: string };
			"/admin/news/create": Record<string, never>;
			"/admin/news/edit": { slug?: string };
			"/admin/news/edit/[slug]": { slug: string };
			"/admin/questionnaire": { id?: string };
			"/admin/questionnaire/create": Record<string, never>;
			"/admin/questionnaire/edit": { id?: string };
			"/admin/questionnaire/edit/[id]": { id: string };
			"/admin/themes": { id?: string };
			"/admin/themes/upload": Record<string, never>;
			"/admin/themes/[id]": { id: string };
			"/api": { path?: string };
			"/api/[...path]": { path: string };
			"/changelogs": Record<string, never>;
			"/changelogs/bqplus": Record<string, never>;
			"/changelogs/desqta": Record<string, never>;
			"/comparison": Record<string, never>;
			"/desqta": Record<string, never>;
			"/download": Record<string, never>;
			"/minecraft": Record<string, never>;
			"/news": { slug?: string };
			"/news/[slug]": { slug: string };
			"/privacy": Record<string, never>;
			"/robots.txt": Record<string, never>;
			"/sitemap.xml": Record<string, never>
		};
		Pathname(): "/" | "/admin" | "/admin/analytics" | "/admin/collections" | "/admin/collections/new" | `/admin/collections/${string}` & {} | "/admin/news" | "/admin/news/create" | `/admin/news/edit/${string}` & {} | "/admin/questionnaire" | "/admin/questionnaire/create" | `/admin/questionnaire/edit/${string}` & {} | "/admin/themes" | "/admin/themes/upload" | `/admin/themes/${string}` & {} | `/api/${string}` & {} | "/changelogs" | "/changelogs/bqplus" | "/changelogs/desqta" | "/comparison" | "/desqta" | "/download" | "/minecraft" | "/news" | `/news/${string}` & {} | "/privacy" | "/robots.txt" | "/sitemap.xml";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/apple-touch-icon.png" | "/favicon-96x96.png" | "/favicon.ico" | "/favicon.svg" | "/fonts/helvetica/helvetica-300-light.woff2" | "/fonts/helvetica/Helvetica-400-italic.woff" | "/fonts/helvetica/Helvetica-400.woff" | "/fonts/helvetica/Helvetica-600-bold-italic.woff" | "/fonts/helvetica/Helvetica-600-bold.woff" | "/fonts/helvetica/helvetica-compressed-5871d14b6903a.woff" | "/fonts/helvetica/helvetica-light-587ebe5a59211.woff" | "/fonts/helvetica/helvetica-rounded-bold-5871d05ead8de.woff" | "/fonts/inter/Inter-variable-400-italic.ttf" | "/fonts/inter/Inter-variable-400.ttf" | "/fonts/motiva/motiva-sans-100-thin.ttf" | "/fonts/motiva/motiva-sans-300-light.woff.ttf" | "/fonts/motiva/motiva-sans-400-regular.woff.ttf" | "/fonts/motiva/motiva-sans-500-medium.woff.ttf" | "/fonts/motiva/motiva-sans-600-bold.woff.ttf" | "/fonts/motiva/motiva-sans-700-extra-bold.ttf" | "/fonts/motiva/motiva-sans-900-black.woff.ttf" | "/images/2025-06-09 09-51-43.mp4" | "/images/2025_06_06_12_32_38.mp4" | "/images/404.jpg" | "/images/8.png" | "/images/carousel/hl.png" | "/images/carousel/hzd.png" | "/images/carousel/mobile/hl.png" | "/images/carousel/mobile/hzd.png" | "/images/carousel/mobile/store.png" | "/images/carousel/store.png" | "/images/proton.webp" | "/images/screenshots/Assements1.jpeg" | "/images/screenshots/Assements2.jpeg" | "/images/screenshots/Dashboard.jpeg" | "/images/screenshots/Homepage.jpeg" | "/images/screenshots/login.jpeg" | "/images/screenshots/timetable.png" | "/images/ss/assements.png" | "/images/ss/courses.png" | "/images/ss/dashboard.png" | "/images/ss/homepage.png" | "/images/ss/message_inbox.png" | "/images/ss/message_viewing.png" | "/images/ss/news.png" | "/images/ss/notices.png" | "/images/ss/reports.png" | "/images/ss/settings.png" | "/images/updates.png" | "/site.webmanifest" | "/web-app-manifest-192x192.png" | "/web-app-manifest-512x512.png" | string & {};
	}
}