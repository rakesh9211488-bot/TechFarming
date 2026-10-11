export async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin', ...options,
    headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...options.headers },
  });
  let data;
  try { data = await response.json(); } catch { throw new Error('The server returned an unexpected response. Check that the API is running.'); }
  if (!response.ok) {
    const error = new Error(data.error || 'Unable to complete this request');
    error.status = response.status; throw error;
  }
  return data;
}
