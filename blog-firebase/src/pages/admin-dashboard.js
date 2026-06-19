import { logoutUser } from "../services/auth.service.js";

import { listPostsAdmin, deletePostById } from "../services/posts.service.js";

import { renderPostEditor } from "./admin-post-editor.js";

import { escapeHtml, formatDate, getStatusLabel } from "../utils/helpers.js";

export function renderDashboard(rootElement, user, adminProfile) {
  rootElement.innerHTML = `
    <section class="admin-shell">
      <aside class="admin-sidebar">
        <div>
          <p class="admin-eyebrow">Painel</p>
          <h1 class="admin-logo">Blog Admin</h1>
        </div>

        <nav class="admin-nav">
          <button class="admin-nav__item active" id="navPosts" type="button">
            Posts
          </button>

          <button class="admin-nav__item" id="navNewPost" type="button">
            Novo post
          </button>
        </nav>

        <button class="admin-logout" id="logoutButton" type="button">
          Sair
        </button>
      </aside>

      <main class="admin-content">
        <header class="admin-topbar">
          <div>
            <p class="admin-eyebrow">Bem-vindo</p>
            <h2 class="admin-heading">Gerenciar Blog</h2>
          </div>

          <div class="admin-user">
            ${escapeHtml(user.email)} · ${escapeHtml(adminProfile.role)}
          </div>
        </header>

        <div id="adminView"></div>
      </main>
    </section>
  `;

  const view = document.getElementById("adminView");
  const logoutButton = document.getElementById("logoutButton");
  const navPosts = document.getElementById("navPosts");
  const navNewPost = document.getElementById("navNewPost");

  function setActiveNav(activeButton) {
    [navPosts, navNewPost].forEach((button) => {
      button.classList.remove("active");
    });

    activeButton.classList.add("active");
  }

  async function renderPostsList() {
    setActiveNav(navPosts);

    view.innerHTML = `
      <section class="admin-panel">
        <div class="admin-section-header">
          <div>
            <p class="admin-eyebrow">Posts</p>
            <h3>Conteúdos cadastrados</h3>
          </div>

          <button class="admin-secondary-button" id="createPostButton" type="button">
            Criar novo post
          </button>
        </div>

        <p class="admin-text">
          Carregando posts...
        </p>
      </section>
    `;

    try {
      const posts = await listPostsAdmin();

      const publishedCount = posts.filter(
        (post) => post.status === "published",
      ).length;
      const draftCount = posts.filter(
        (post) => post.status !== "published",
      ).length;

      view.innerHTML = `
        <section class="admin-grid">
          <article class="admin-stat">
            <span class="admin-stat__number">${posts.length}</span>
            <p class="admin-stat__label">Total de posts</p>
          </article>

          <article class="admin-stat">
            <span class="admin-stat__number">${publishedCount}</span>
            <p class="admin-stat__label">Publicados</p>
          </article>

          <article class="admin-stat">
            <span class="admin-stat__number">${draftCount}</span>
            <p class="admin-stat__label">Rascunhos</p>
          </article>
        </section>

        <section class="admin-panel">
          <div class="admin-section-header">
            <div>
              <p class="admin-eyebrow">Posts</p>
              <h3>Conteúdos cadastrados</h3>
            </div>

            <button class="admin-secondary-button" id="createPostButton" type="button">
              Criar novo post
            </button>
          </div>

          ${
            posts.length === 0
              ? `
                <div class="admin-empty">
                  <h4>Nenhum post criado ainda</h4>
                  <p>Crie o primeiro conteúdo do blog pelo painel.</p>
                </div>
              `
              : `
                <div class="admin-post-list">
                  ${posts.map((post) => `
                    <article class="admin-post-item">
                      ${post.coverImage?.url ? `
                        <div class="admin-post-thumb">
                          <img src="${escapeHtml(post.coverImage.url)}" alt="${escapeHtml(post.title)}">
                        </div>
                      ` : `
                        <div class="admin-post-thumb empty">
                          Sem imagem
                        </div>
                      `}

                      <div class="admin-post-info">
                        <div class="admin-post-meta">
                          <span class="admin-status ${post.status === "published" ? "published" : "draft"}">
                            ${getStatusLabel(post.status)}
                          </span>
                          <span class="admin-post-date">
                            ${formatDate(post.updatedAt)}
                          </span>
                        </div>

                        <h4>${escapeHtml(post.title)}</h4>

                        <p>${escapeHtml(post.excerpt)}</p>
                      </div>

                      <div class="admin-post-actions">
                        <button class="admin-secondary-button edit-post-button" data-post-id="${post.id}" type="button">
                          Editar
                        </button>

                        <button class="admin-danger-button delete-post-button" data-post-id="${post.id}" type="button">
                          Excluir
                        </button>
                      </div>
                    </article>
                  `).join("")}
                </div>
              `
          }
        </section>
      `;

      const createPostButton = document.getElementById("createPostButton");

      createPostButton.addEventListener("click", function () {
        renderNewPost();
      });

      document.querySelectorAll(".edit-post-button").forEach((button) => {
        button.addEventListener("click", function () {
          const postId = button.dataset.postId;
          const post = posts.find((item) => item.id === postId);

          renderEditPost(post);
        });
      });

      document.querySelectorAll(".delete-post-button").forEach((button) => {
        button.addEventListener("click", async function () {
          const postId = button.dataset.postId;
          const post = posts.find((item) => item.id === postId);

          const confirmDelete = confirm(
            `Tem certeza que deseja excluir o post "${post.title}"?`,
          );

          if (!confirmDelete) return;

          try {
            await deletePostById(postId);
            await renderPostsList();
          } catch (error) {
            console.error(error);
            alert("Erro ao excluir post.");
          }
        });
      });
    } catch (error) {
      console.error(error);

      view.innerHTML = `
        <section class="admin-panel">
          <p class="admin-eyebrow">Erro</p>
          <h3>Não foi possível carregar os posts</h3>
          <p class="admin-text">${escapeHtml(error.message)}</p>
        </section>
      `;
    }
  }

  function renderNewPost() {
    setActiveNav(navNewPost);

    renderPostEditor(view, {
      user,
      post: null,
      onBack: renderPostsList,
      onSaved: renderPostsList,
    });
  }

  function renderEditPost(post) {
    setActiveNav(navPosts);

    renderPostEditor(view, {
      user,
      post,
      onBack: renderPostsList,
      onSaved: renderPostsList,
    });
  }

  logoutButton.addEventListener("click", async function () {
    await logoutUser();
  });

  navPosts.addEventListener("click", function () {
    renderPostsList();
  });

  navNewPost.addEventListener("click", function () {
    renderNewPost();
  });

  renderPostsList();
}

export function renderAccessDenied(rootElement, user) {
  rootElement.innerHTML = `
    <section class="admin-page">
      <div class="admin-card">
        <p class="admin-eyebrow">Acesso bloqueado</p>

        <h1 class="admin-title">
          Usuário sem permissão
        </h1>

        <p class="admin-text">
          O usuário <strong>${escapeHtml(user.email)}</strong> está logado, mas não possui
          autorização para acessar o painel administrativo.
        </p>

        <p class="admin-text">
          Para liberar o acesso, crie um documento no Firestore em
          <strong>adminUsers/${escapeHtml(user.uid)}</strong>.
        </p>

        <button class="admin-button" id="logoutButton" type="button">
          Sair
        </button>
      </div>
    </section>
  `;

  const logoutButton = document.getElementById("logoutButton");

  logoutButton.addEventListener("click", async function () {
    await logoutUser();
  });
}
