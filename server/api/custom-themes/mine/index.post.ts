import { requireAuth } from '../../../utils/auth';
import { getUserThemesDB } from '../../../utils/userThemesDb';
import {
  checkUploadRateLimits,
  parseMultipartThemeFiles,
  processCustomThemeUpload
} from '../../../utils/customThemes';

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event);
  const db = getUserThemesDB(event);

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
