
const DEFAULT_URL = import.meta.env.VITE_POCKETBASE_URL || "http://127.0.0.1:8090";

export function getBaseUrl() {
  return (localStorage.getItem("pocketbase_url") || DEFAULT_URL).replace(/\/+$/, "");
}

export function setBaseUrl(value) {
  localStorage.setItem("pocketbase_url", value.trim().replace(/\/+$/, ""));
}

async function request(path, options = {}) {
  const response = await fetch(`${getBaseUrl()}${path}`, options);
  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      data?.message ||
      (data?.data && Object.values(data.data).map(x => x.message).filter(Boolean).join(" ")) ||
      "No se pudo completar la operación.";

    throw new Error(message);
  }

  return data;
}

export function listRecords(collection, params = {}) {
  const query = new URLSearchParams({ perPage: "200", ...params });
  return request(`/api/collections/${collection}/records?${query}`);
}

export function getRecord(collection, id, params = {}) {
  const query = new URLSearchParams(params);
  const suffix = query.size ? `?${query}` : "";

  return request(`/api/collections/${collection}/records/${encodeURIComponent(id)}${suffix}`);
}

export function createRecord(collection, values) {
  return request(`/api/collections/${collection}/records`, {
    method: "POST",
    body: values instanceof FormData ? values : JSON.stringify(values),
    headers: values instanceof FormData ? undefined : { "Content-Type": "application/json" }
  });
}

export function updateRecord(collection, id, values) {
  return request(`/api/collections/${collection}/records/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: values instanceof FormData ? values : JSON.stringify(values),
    headers: values instanceof FormData ? undefined : { "Content-Type": "application/json" }
  });
}

export function healthCheck() {
  return request("/api/health");
}

export function fileUrl(record, filename) {
  if (!record || !filename) return "";
  return `${getBaseUrl()}/api/files/${record.collectionName}/${record.id}/${encodeURIComponent(filename)}`;
}

export const STATES = [
  "solicitada",
  "en_diagnostico",
  "presupuestada",
  "aprobada",
  "rechazada",
  "en_reparacion",
  "lista",
  "entregada",
  "cancelada"
];

export const STATE_LABELS = {
  solicitada: "Solicitada",
  en_diagnostico: "En diagnóstico",
  presupuestada: "Presupuestada",
  aprobada: "Aprobada",
  rechazada: "Rechazada",
  en_reparacion: "En reparación",
  lista: "Lista",
  entregada: "Entregada",
  cancelada: "Cancelada"
};

export function money(value) {
  return new Intl.NumberFormat("es", {
    style: "currency",
    currency: "USD"
  }).format(Number(value || 0));
}

export function quoteTotal(labor, parts) {
  return Number(labor || 0) + (parts || []).reduce(
    (sum, part) => sum + Number(part.cantidad || 0) * Number(part.precio || 0),
    0
  );
}
