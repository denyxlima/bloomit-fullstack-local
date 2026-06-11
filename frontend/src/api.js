const API_URL = import.meta.env.VITE_API_URL || '/api';

export function getToken() {
  return localStorage.getItem('bloomit_token');
}

export function setSession(data) {
  localStorage.setItem('bloomit_token', data.token);
  localStorage.setItem('bloomit_user', JSON.stringify(data.user));
  localStorage.setItem('bloomit_company', JSON.stringify(data.company));
}

export function clearSession() {
  localStorage.removeItem('bloomit_token');
  localStorage.removeItem('bloomit_user');
  localStorage.removeItem('bloomit_company');
}

export async function api(path, options = {}) {
  const token = getToken();
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    }
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    throw new Error(data?.message || 'Erro ao comunicar com a API.');
  }

  return data;
}
