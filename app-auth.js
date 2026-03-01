// Helpers de auth (JWT) para el frontend
// Importante: este archivo puede cargarse ANTES que assets/api.js.
<<<<<<< HEAD
// Por eso NO leemos window.API_URL una sola vez arriba; lo resolvemos dinámicamente.
// Si window.API_URL no existe todavía, usamos el backend de Render como fallback.
=======
// Por eso resolvemos dinámicamente el API base.
>>>>>>> bdb76f2 (Fix API base for pets (Render) + avoid SRV/same-origin)
function getApiBase() {
  if (typeof window !== "undefined" && window.API_URL) return window.API_URL;
  return "https://proyectofinal-vetbackend.onrender.com";
}

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

function setUser(user) {
  localStorage.setItem("user", JSON.stringify(user));
}

function getUser() {
  const raw = localStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}

// apiFetch devuelve el JSON (o null si viene vacío). Si hay error HTTP, lanza Error.
async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(getApiBase() + path, { ...options, headers });

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

function requireLogin() {
  if (!getToken()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

function renderAuthNav() {
  const nav = document.querySelector("header nav");
  if (!nav) return;

  // evita duplicados
  if (nav.querySelector("[data-auth]")) return;

  const token = getToken();
  const user = getUser();

  const a = document.createElement("a");
  a.className = "nav-link";
  a.dataset.auth = "1";

  if (!token) {
    a.href = "login.html";
    a.textContent = "Iniciar sesión";
  } else {
    a.href = "#";
    a.textContent = user?.role === "admin" ? "Cerrar sesión (admin)" : "Cerrar sesión";
    a.addEventListener("click", (e) => {
      e.preventDefault();
      clearToken();
      window.location.href = "index.html";
    });
  }

  nav.appendChild(a);
}
