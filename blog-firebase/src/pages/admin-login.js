import { loginWithEmail } from "../services/auth.service.js";

function getAuthErrorMessage(error) {
  const code = error?.code;

  if (code === "auth/invalid-email") {
    return "O e-mail informado é inválido.";
  }

  if (code === "auth/user-disabled") {
    return "Este usuário foi desativado.";
  }

  if (code === "auth/user-not-found") {
    return "Usuário não encontrado.";
  }

  if (code === "auth/wrong-password") {
    return "Senha incorreta.";
  }

  if (code === "auth/invalid-credential") {
    return "E-mail ou senha incorretos.";
  }

  if (code === "auth/too-many-requests") {
    return "Muitas tentativas. Aguarde alguns minutos e tente novamente.";
  }

  return "Não foi possível entrar. Verifique os dados e tente novamente.";
}

export function renderLogin(rootElement) {
  rootElement.innerHTML = `
    <section class="admin-page">
      <div class="admin-card">
        <p class="admin-eyebrow">Acesso restrito</p>

        <h1 class="admin-title">
          Painel do Blog
        </h1>

        <p class="admin-text">
          Entre com o usuário autorizado para criar, editar, publicar e excluir posts do blog.
        </p>

        <form class="admin-form" id="loginForm">
          <label class="admin-label">
            E-mail
            <input
              class="admin-input"
              type="email"
              id="email"
              autocomplete="email"
              placeholder="cliente@email.com"
              required
            />
          </label>

          <label class="admin-label">
            Senha
            <input
              class="admin-input"
              type="password"
              id="password"
              autocomplete="current-password"
              placeholder="Digite sua senha"
              required
            />
          </label>

          <button class="admin-button" id="loginButton" type="submit">
            Entrar no painel
          </button>

          <p class="admin-message" id="loginMessage"></p>
        </form>
      </div>
    </section>
  `;

  const form = document.getElementById("loginForm");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const button = document.getElementById("loginButton");
  const message = document.getElementById("loginMessage");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    message.textContent = "";
    button.disabled = true;
    button.textContent = "Entrando...";

    try {
      await loginWithEmail(email, password);
    } catch (error) {
      console.error(error);
      message.textContent = getAuthErrorMessage(error);
      button.disabled = false;
      button.textContent = "Entrar no painel";
    }
  });
}