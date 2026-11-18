import { requireAdmin } from '../../../../utils/auth';
import { createApiEnvelope } from '../../../../utils/customThemes';
import { promoteCustomThemeToMarketplace } from '../../../../utils/promoteCustomThemeToMarketplace';

interface PromoteBody {
  marketplaceStatus?: 'approved' | 'pending';
  slug?: string;
}

export default defineEventHandler(async (event) => {
  const adminUser = await requireAdmin(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  const body = (await readBody<PromoteBody>(event).catch(() => ({}))) ?? {};

  const result = await promoteCustomThemeToMarketplace(event, id, {
    adminUserId: adminUser.id,
    marketplaceStatus: body.marketplaceStatus,
    slug: body.slug
  });

  return createApiEnvelope({
    ...result,
    message: result.already_promoted
      ? 'This community theme is already in the official theme store'
      : 'Community theme imported into the official theme store',
    admin_theme_url: `/admin/themes/${result.marketplace_theme_id}`,
    public_theme_url: `/themes/${result.slug}`
  });
});