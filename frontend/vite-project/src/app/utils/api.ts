export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(method: string, path: string, body?: unknown) {
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      let message = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        message = err.message || err.error || message;
      } catch {
        // keep default message
      }
      throw new Error(message);
    }

    const text = await res.text();
    return text ? JSON.parse(text) : null;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Cannot connect to backend at ${API_BASE_URL}. Check VITE_API_URL, backend deployment, and CORS.`);
    }
    throw error;
  }
}

async function uploadReceipt(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/upload-struk`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || err.error || `HTTP ${res.status}`);
  }

  return res.json();
}

export const api = {
  get: (path: string) => request("GET", path),
  post: (path: string, body: unknown) => request("POST", path, body),
  put: (path: string, body: unknown) => request("PUT", path, body),
  delete: (path: string) => request("DELETE", path),
  uploadReceipt,
};
