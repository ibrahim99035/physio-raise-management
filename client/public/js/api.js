const defaultHeaders = {
  'Content-Type': 'application/json'
};

export async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: { ...defaultHeaders, ...(options.headers || {}) },
    ...options
  });

  if (response.status === 401) {
    window.location.href = '/login.html';
    return null;
  }

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}
