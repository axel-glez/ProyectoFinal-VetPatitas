// auth.js (ES Module) — helpers para manejar sesión (JWT) en el frontend

// En Vercel, el frontend vive en otro dominio.
// Ojo: este archivo puede cargarse antes que ./api.js, así que resolvemos dinámicamente.
function getApiBase() {
  if (typeof window !== "undefined" && window.API_URL) return window.API_URL;
  return "https://proyectofinal-vetbackend.onrender.com";
}

// -------- Storage helpers --------
export function getToken() {
  return localStorage.getItem("token");
}

export function getUser() {
  const raw = localStorage.getItem("user");
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

export function setSession({ token, user }) {
  if (token) localStorage.setItem("token", token);
  if (user) localStorage.setItem("user", JSON.stringify(user));
}

export function clearSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// -------- API helpers --------
export async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = Object.assign(
    { "Content-Type": "application/json" },
    options.headers || {}
  );
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(getApiBase() + path, { ...options, headers });

  // intentamos leer json, pero sin romper si viene vacío
  let data = null;
  const text = await res.text();
  try { data = text ? JSON.parse(text) : null; } catch { data = { raw: text }; }

  if (!res.ok) {
    const msg = (data && data.message) ? data.message : `Error HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// -------- Session validation --------
/**
 * Devuelve el usuario si el token es válido.
 * Si el token expiró / es inválido, limpia sesión y devuelve null.
 */
export async function me() {
  const token = getToken();
  if (!token) return null;

  try {
    const data = await apiFetch("/api/auth/me", { method: "GET" });
    // backend responde { user: {...} }
    if (data && data.user) {
      // mantener user sincronizado
      setSession({ token, user: data.user });
      return data.user;
    }
    // fallback si por alguna razón no viene user
    const u = getUser();
    return u;
  } catch (err) {
    // 401/403 => token inválido o expirado
    if (err && (err.status === 401 || err.status === 403)) {
      clearSession();
      return null;
    }
    // otros errores (ej. server caído): no rompemos el flujo
    return getUser();
  }
}

/**
 * Fuerza login si no hay sesión válida.
 * Retorna el usuario si ok, o nunca retorna (redirige).
 */
export async function requireLogin() {
  const u = await me();
  if (!u) {
    window.location.href = "login.html";
    throw new Error("No logueado");
  }
  return u;
}

/**
 * Fuerza rol admin; si no, redirige.
 */
export async function requireAdmin() {
  const u = await requireLogin();
  if (u.role !== "admin") {
    window.location.href = "index.html";
    throw new Error("No autorizado");
  }
  return u;
}

export function logout() {
  clearSession();
  window.location.href = "login.html";
}
