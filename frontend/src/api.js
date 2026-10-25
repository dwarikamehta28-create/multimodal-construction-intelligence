import { useCallback, useRef, useState } from "react";

const BASE = import.meta.env.VITE_API_BASE ?? "";

export class ApiError extends Error {
  constructor(message, code = "error", status = 0) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request(path, init) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, init);
  } catch {
    throw new ApiError("Cannot reach the server. Check that the backend is running.", "network");
  }
  let body = null;
  try {
    body = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok || !body || body.ok === false) {
    throw new ApiError(body?.error?.message || `Request failed (${res.status}).`, body?.error?.code, res.status);
  }
  return body; // { ok, mode, engine, warnings, data }
}

export const postJson = (path, payload) =>
  request(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

export function postForm(path, fields, files = []) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => fd.append(k, v ?? ""));
  files.forEach((f) => fd.append("images", f));
  return request(path, { method: "POST", body: fd });
}

export function useRun(fn) {
  const [state, setState] = useState({ loading: false, error: null, result: null });
  const latest = useRef(fn);
  latest.current = fn; // always call the newest closure so form values are never stale
  const run = useCallback(
    async (...args) => {
      setState((s) => ({ ...s, loading: true, error: null }));
      try {
        setState({ loading: false, error: null, result: await latest.current(...args) });
      } catch (e) {
        setState({ loading: false, error: e.message || "Something went wrong.", result: null });
      }
    },
    []
  );
  return { ...state, run };
}

export const list = (x) => (Array.isArray(x) ? x : []);

export function inr(n) {
  if (typeof n !== "number" || Number.isNaN(n)) return "–";
  if (n >= 1e7) return `₹${(n / 1e7).toFixed(2)} Cr`;
  if (n >= 1e5) return `₹${(n / 1e5).toFixed(2)} L`;
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}
