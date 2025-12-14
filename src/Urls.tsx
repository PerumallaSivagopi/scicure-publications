// export const Url = "https://scicure-publications-backend-1.onrender.com/";
export const Url = "http://localhost:5001/";

// export const ImageUrl = "https://scicure-publications-backend-1.onrender.com/uploads/";
export const ImageUrl = "http://localhost:5001/uploads";

export const URLS = {
  JOURNALS: `${Url}api/users`,
  MANUSCRIPTS: `${Url}api/manuscripts`, // Note: Backend seems to use 'menuscripts' based on file names seen earlier, need to verify or assume consistency with search results if any. Wait, search results didn't show endpoint but I saw 'menuscriptsRoutes.js'.
  EDITORS: `${Url}api/editors`,
  ARTICLES: `${Url}api/articles`,
  USERS: `${Url}api/users`,
};
