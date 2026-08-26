import { getCloudflareBinding } from './db';

export const getUserThemesDB = (event: any): any =>
  getCloudflareBinding(event, 'USER_THEMES_DB');
