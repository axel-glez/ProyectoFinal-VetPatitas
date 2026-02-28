// nav-init.js — Ajusta el header según sesión (oculta Admin si no corresponde)
// Se usa en páginas públicas (inicio, registro, historial, login, crear cuenta, etc.)

import { me, logout } from "./auth.js";

// Micro-movimiento global al usar la rueda del mouse (sutil)
import "./page-motion.js";

function qs(sel, root = document) {
  return root.querySelector(sel);
}

function setAdminVisibility(isVisible) {
  const existing = Array.from(document.querySelectorAll('a[href*="admin.html"]'));
  if (!isVisible) {
    existing.forEach(a => a.remove());
    return;
  }

  const nav = qs('.patitas-nav');
  if (!nav) return;

  const already = nav.querySelector('a[href="admin.html"]');
  if (already) return;

  const a = document.createElement('a');
  a.href = 'admin.html';
  a.className = 'patitas-nav-link';
  a.textContent = 'Administración';
  nav.appendChild(a);
}

function setEstadoVisibility(isVisible) {
  const existing = Array.from(document.querySelectorAll('a[href="estado.html"]'));
  if (!isVisible) {
    existing.forEach(a => a.remove());
    return;
  }

  const nav = qs('.patitas-nav');
  if (!nav) return;

  const already = nav.querySelector('a[href="estado.html"]');
  if (already) return;

  const a = document.createElement('a');
  a.href = 'estado.html';
  a.className = 'patitas-nav-link';
  a.textContent = 'Estado';
  nav.appendChild(a);
}

function renderAuthArea(user) {
  const authBox = qs(".patitas-auth");
  if (!authBox) return;

  authBox.innerHTML = "";

  if (!user) {
    const a1 = document.createElement("a");
    a1.className = "patitas-auth-link";
    a1.href = "registrousuario.html";
    a1.textContent = "Crear cuenta";

    const sep = document.createElement("span");
    sep.className = "patitas-auth-sep";
    sep.textContent = "|";

    const a2 = document.createElement("a");
    a2.className = "patitas-auth-link";
    a2.href = "login.html";
    a2.textContent = "Iniciar sesión";

    authBox.appendChild(a1);
    authBox.appendChild(sep);
    authBox.appendChild(a2);
    return;
  }

  const who = document.createElement("span");
  who.className = "patitas-auth-who";
  who.textContent = `${(user.name || user.email || "Usuario").toUpperCase()} • ${user.role}`;

  const sep = document.createElement("span");
  sep.className = "patitas-auth-sep";
  sep.textContent = "|";

  const btn = document.createElement("button");
  btn.className = "patitas-auth-btn";
  btn.type = "button";
  btn.textContent = "Cerrar sesión";
  btn.onclick = async () => {
    await logout();
    window.location.href = "login.html";
  };

  authBox.appendChild(who);
  authBox.appendChild(sep);
  authBox.appendChild(btn);
}

(async () => {
  const user = await me().catch(() => null);

  // ✅ Estado: aparece para cualquier usuario logueado
  setEstadoVisibility(!!user);

  // ✅ Admin: aparece solo si role=admin
  setAdminVisibility(user?.role === "admin");

  renderAuthArea(user);
})();