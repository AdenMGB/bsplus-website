-- Normalize stored theme asset URLs to absolute https://betterseqta.org (extension clients expect full URLs)

UPDATE themes
SET cover_image_url = 'https://betterseqta.org' || cover_image_url
WHERE cover_image_url LIKE '/api/images/%';

UPDATE themes
SET marquee_image_url = 'https://betterseqta.org' || marquee_image_url
WHERE marquee_image_url LIKE '/api/images/%';

UPDATE themes
SET preview_thumbnail_url = 'https://betterseqta.org' || preview_thumbnail_url
WHERE preview_thumbnail_url LIKE '/api/images/%';

UPDATE themes
SET zip_download_url = 'https://betterseqta.org' || zip_download_url
WHERE zip_download_url LIKE '/api/images/%';

UPDATE themes
SET preview_screenshots = REPLACE(preview_screenshots, '"/api/images/', '"https://betterseqta.org/api/images/')
WHERE preview_screenshots LIKE '%"/api/images/%';

UPDATE custom_themes
SET cover_image_url = 'https://betterseqta.org' || cover_image_url
WHERE cover_image_url LIKE '/api/images/%';

UPDATE custom_themes
SET marquee_image_url = 'https://betterseqta.org' || marquee_image_url
WHERE marquee_image_url LIKE '/api/images/%';

UPDATE custom_themes
SET preview_thumbnail_url = 'https://betterseqta.org' || preview_thumbnail_url
WHERE preview_thumbnail_url LIKE '/api/images/%';
