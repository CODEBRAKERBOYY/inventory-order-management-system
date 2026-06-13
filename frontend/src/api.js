const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  if (response.status === 204) return null;

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = Array.isArray(data.detail)
      ? data.detail.map((item) => item.msg).join(", ")
      : data.detail || "Request failed";
    throw new Error(detail);
  }
  return data;
}

export const api = {
  dashboard: () => request("/dashboard"),
  products: () => request("/products"),
  product: (id) => request(`/products/${id}`),
  createProduct: (payload) => request("/products", { method: "POST", body: JSON.stringify(payload) }),
  updateProduct: (id, payload) => request(`/products/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteProduct: (id) => request(`/products/${id}`, { method: "DELETE" }),
  customers: () => request("/customers"),
  createCustomer: (payload) => request("/customers", { method: "POST", body: JSON.stringify(payload) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: "DELETE" }),
  orders: () => request("/orders"),
  order: (id) => request(`/orders/${id}`),
  createOrder: (payload) => request("/orders", { method: "POST", body: JSON.stringify(payload) }),
  deleteOrder: (id) => request(`/orders/${id}`, { method: "DELETE" }),
};
