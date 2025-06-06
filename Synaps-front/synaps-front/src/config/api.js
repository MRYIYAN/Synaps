// Configuración de la API base
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8010';

export const API_ENDPOINTS = {
  base: API_BASE_URL,
  galaxyGraph: `${API_BASE_URL}/api/galaxyGraph`,
  getFolders: `${API_BASE_URL}/api/getFolders`,
  readNote: `${API_BASE_URL}/api/readNote`,
  vaults: `${API_BASE_URL}/api/vaults`,
  user: `${API_BASE_URL}/api/user`,
  login: `${API_BASE_URL}/api/login`,
  register: `${API_BASE_URL}/api/register`,
  addNote: `${API_BASE_URL}/api/addNote`,
  addFolder: `${API_BASE_URL}/api/addFolder`,
  deleteFolder: `${API_BASE_URL}/api/deleteFolder`,
  getNotes: `${API_BASE_URL}/api/getNotes`,
  deleteNote: `${API_BASE_URL}/api/deleteNote`,
  renameNote: `${API_BASE_URL}/api/renameNote`,
  renameFolder: `${API_BASE_URL}/api/renameFolder`,
  searchNotes: `${API_BASE_URL}/api/searchNotes`,
  uploadFile: `${API_BASE_URL}/api/uploadFile`,
};

export default API_ENDPOINTS;
