// Small fetch wrapper around the Express API.
const API_BASE = '/api';

async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

const Api = {
  getProducts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/products${query ? `?${query}` : ''}`);
  },
  getCategories: () => apiRequest('/products/categories'),
  getProduct: (id) => apiRequest(`/products/${id}`),
  createOrder: (payload) =>
    apiRequest('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrder: (id) => apiRequest(`/orders/${id}`),
};
