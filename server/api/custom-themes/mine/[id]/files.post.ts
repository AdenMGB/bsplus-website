import { requireAuth } from '../../../../utils/auth';
import { getUserThemesDB } from '../../../../utils/userThemesDb';
import {
  assertEditableStatus,
  assertThemeOwner,
  checkUploadRateLimits,
  deleteCustomThemeAssets,
  getCustomThemeById,
  parseMultipartThemeFiles,
  processCustomThemeUpload
} from '../../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const db = getUserThemesDB(event);
  const id = getRouterParam(event, 'id');

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Theme ID is required'
    });
  }

  const theme = await getCustomThemeById(db, id);
  if (!theme) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Theme not found'
    });
  }

  assertThemeOwner(theme, user.id);
  assertEditableStatus(theme.status);

  await checkUploadRateLimits(db, user.id);

  await deleteCustomThemeAssets(event, id);

  const { themeFiles, submissionNotes } = await parseMultipartThemeFiles(event);
  const result = await processCustomThemeUpload(event, themeFiles, {
    author: user,
    submissionNotes: submissionNotes ?? theme.submission_notes ?? undefined,
    replaceThemeId: id
  });

  if (!result.success) {
    setResponseStatus(event, 422);
  }

  return result;
});
