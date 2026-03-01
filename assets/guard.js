// assets/guard.js
// Bloquea acceso a páginas protegidas si no hay sesión (token JWT).
(function () {
  const token = localStorage.getItem("token");
  const loginPage = "login.html";

  if (!token) {
    const current = window.location.pathname.split("/").pop() || "index.html";
    if (current.toLowerCase() !== loginPage) {
      window.location.replace(loginPage);
    }
  }
})();
