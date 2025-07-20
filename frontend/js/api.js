const api = {
  async request(method, url, data) {
    const opts = {
      method,
      headers: { "Content-Type": "application/json" },
    };
    if (data !== undefined) opts.body = JSON.stringify(data);

    const res = await fetch(url, opts);
    if (!res.ok) {
      const errPayload = await res.json().catch(() => ({}));
      throw new Error(
        errPayload?.detail || `${res.status} ${res.statusText}`
      );
    }
    if (res.status === 204) return null;
    return res.json();
  },
  get(url) {
    return this.request("GET", url);
  },
  post(url, data) {
    return this.request("POST", url, data);
  },
  put(url, data) {
    return this.request("PUT", url, data);
  },
  del(url) {
    return this.request("DELETE", url);
  },
};

export default api;
