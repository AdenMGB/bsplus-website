import { fetchApprovedCustomThemeList } from '../../utils/customThemes';

export default defineEventHandler((event) => fetchApprovedCustomThemeList(event));
