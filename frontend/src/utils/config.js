const configuredApiUrl = import.meta.env.VITE_API_URL?.trim();
const configuredSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim();

const API_BASE_URL = configuredApiUrl || (import.meta.env.DEV ? 'http://localhost:5000' : '');
const SOCKET_URL = configuredSocketUrl || (import.meta.env.DEV ? API_BASE_URL : '');

export { API_BASE_URL, SOCKET_URL };
