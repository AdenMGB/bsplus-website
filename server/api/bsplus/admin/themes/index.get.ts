import { listBsplusAdminThemes, type BsplusAdminThemeListQuery } from '../../../../utils/bsplusAdminThemes';

export default defineEventHandler(async (event) => {
  const query = getQuery<BsplusAdminThemeListQuery>(event);
  return listBsplusAdminThemes(event, query);
});
