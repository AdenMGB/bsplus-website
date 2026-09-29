import { requireAuth } from '../../../utils/auth';
import { getDB } from '../../../utils/db';
import { parseThemeUploadMultipart } from '../../../utils/themes';
import { checkUploadRateLimits, processCustomThemeUpload } from '../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const db = getDB(event);

  await checkUploadRateLimits(db, user.id);

  const { themeFiles, submissionNotes } = await parseThemeUploadMultipart(event);
  const result = await processCustomThemeUpload(event, themeFiles, {
    author: user,
    submissionNotes
  });

  if (!result.success) {
    setResponseStatus(event, 422);
  }

  return result;
});
