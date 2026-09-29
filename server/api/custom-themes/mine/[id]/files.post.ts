import { requireAuth } from '../../../../utils/auth';
import { getDB } from '../../../../utils/db';
import { parseThemeUploadMultipart } from '../../../../utils/themes';
import {
  assertEditableStatus,
  assertThemeOwner,
  checkUploadRateLimits,
  deleteCustomThemeAssets,
  getCustomThemeById,
  processCustomThemeUpload
} from '../../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const db = getDB(event);
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

  const { themeFiles, submissionNotes } = await parseThemeUploadMultipart(event);
  const result = await processCustomThemeUpload(event, themeFiles, {
    author: user,
    submissionNotes:
      submissionNotes ??
      (typeof theme.submission_notes === 'string' ? theme.submission_notes : undefined),
    replaceThemeId: id
  });

  if (!result.success) {
    setResponseStatus(event, 422);
  }

  return result;
});
