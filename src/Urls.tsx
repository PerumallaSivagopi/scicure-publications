export const Url = "http://15.207.14.102:5001/";
// export const Url = "http://localhost:5001/";

export const ImageUrl = "http://15.207.14.102:5001/uploads/";
// export const ImageUrl = "http://localhost:5001/uploads";

export const URLS = {
  JOURNALS: `${Url}api/users`,
  MANUSCRIPTS: `${Url}api/manuscripts`, // Note: Backend seems to use 'menuscripts' based on file names seen earlier, need to verify or assume consistency with search results if any. Wait, search results didn't show endpoint but I saw 'menuscriptsRoutes.js'.
  EDITORS: `${Url}api/editors`,
  ARTICLES: `${Url}api/articles`,
  USERS: `${Url}api/users`,
  CONTACTS: `${Url}api/messages`,
};
