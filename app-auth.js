// Helpers de auth (JWT) para el frontend
const API_BASE = ""; // same-origin (porque el backend sirve el frontend)

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

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = Object.assign({ "Content-Type": "application/json" }, options.headers || {});
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(API_BASE + path, { ...options, headers });

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
