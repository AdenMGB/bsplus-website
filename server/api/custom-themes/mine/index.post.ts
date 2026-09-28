import { requireAuth } from '../../../utils/auth';
import { getDB } from '../../../utils/db';
import {
  checkUploadRateLimits,
  parseMultipartThemeFiles,
  processCustomThemeUpload
} from '../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const db = getDB(event);

  await checkUploadRateLimits(db, user.id);

  const { themeFiles, submissionNotes } = await parseMultipartThemeFiles(event);
  const result = await processCustomThemeUpload(event, themeFiles, {
    author: user,
    submissionNotes
  });

  if (!result.success) {
    setResponseStatus(event, 422);
  }

  return result;
});
