import "./css/global.css";
import "./css/admin.css";

import {
  watchAuthState,
  getAdminProfile
} from "./services/auth.service.js";

import { renderLogin } from "./pages/admin-login.js";

import {
  renderDashboard,
  renderAccessDenied
} from "./pages/admin-dashboard.js";

const root = document.getElementById("adminRoot");

if (!root) {
  throw new Error("Elemento #adminRoot não encontrado.");
}

function renderLoading() {
  root.innerHTML = `
    <section class="admin-page">
      <div class="admin-card">
        <p class="admin-eyebrow">Carregando</p>
        <h1 class="admin-title">Verificando acesso...</h1>
        <p class="admin-text">
          Aguarde enquanto verificamos se o usuário possui permissão administrativa.
        </p>
      </div>
    </section>
  `;
}

function renderError(error) {
  root.innerHTML = `
    <section class="admin-page">
      <div class="admin-card">
        <p class="admin-eyebrow">Erro</p>
        <h1 class="admin-title">Falha ao carregar painel</h1>
        <p class="admin-text">
          Verifique o console do navegador para mais detalhes.
        </p>
        <p class="admin-message">${error.message}</p>
      </div>
    </section>
  `;
}

renderLoading();

watchAuthState(async function (user) {
  try {
    if (!user) {
      renderLogin(root);
      return;
    }

    renderLoading();

    const adminProfile = await getAdminProfile(user);

    if (!adminProfile) {
      renderAccessDenied(root, user);
      return;
    }

    renderDashboard(root, user, adminProfile);
  } catch (error) {
    console.error(error);
    renderError(error);
  }
});