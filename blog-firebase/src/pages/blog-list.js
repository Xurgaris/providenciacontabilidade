import {
  listPublishedPosts,
  getPublishedPostBySlug,
} from "../services/posts.service.js";
import { markdownToHtml } from "../utils/markdown.js";
// Função auxiliar para evitar vulnerabilidades de XSS injetando HTML malicioso
function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(timestamp) {
  if (!timestamp?.toDate) return "";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(timestamp.toDate());
}

function renderTags(tags) {
  if (!Array.isArray(tags) || tags.length === 0) return "";
  return `
    <div class="blog-tags">
      ${tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
    </div>
  `;
}

/* RENDERIZAR LISTA DE POSTS */
export async function renderBlogList(rootElement) {
  rootElement.innerHTML = `
    <section class="blog-container">
      <p class="blog-eyebrow">Blog</p>
      <h1 class="blog-title">Conteúdos, novidades e orientações para seus clientes.</h1>
      <p class="blog-description">Artigos publicados pelo painel administrativo.</p>
      <div class="blog-grid">
        <article class="blog-card">
          <div class="blog-card__content">
            <p class="blog-card__tag">Carregando</p>
            <h2 class="blog-card__title">Buscando posts publicados...</h2>
            <p class="blog-card__excerpt">Aguarde enquanto carregamos os conteúdos do blog.</p>
          </div>
        </article>
      </div>
    </section>
  `;

  try {
    const posts = await listPublishedPosts();

    rootElement.innerHTML = `
      <section class="blog-container">
        <p class="blog-eyebrow">Blog</p>
        <h1 class="blog-title">Conteúdos, novidades e orientações para seus clientes.</h1>
        <p class="blog-description">Artigos publicados pelo painel administrativo.</p>
        ${
          posts.length === 0
            ? `
            <div class="blog-empty">
              <h2>Nenhum post publicado ainda</h2>
              <p>Crie um post no painel administrativo e marque o status como publicado.</p>
            </div>
          `
            : `
            <div class="blog-grid">
              ${posts
                .map(
                  (post) => `
                <article class="blog-card">
                  ${
                    post.coverImage?.url
                      ? `
                      <a href="/?post=${escapeHtml(post.slug)}" class="blog-card__image">
                        <img src="${escapeHtml(post.coverImage.url)}" alt="${escapeHtml(post.title)}">
                      </a>
                    `
                      : ""
                  }
                  <div class="blog-card__content">
                    <p class="blog-card__tag">${formatDate(post.publishedAt)}</p>
                    <h2 class="blog-card__title">
                      <a href="/?post=${escapeHtml(post.slug)}">${escapeHtml(post.title)}</a>
                    </h2>
                    <p class="blog-card__excerpt">${escapeHtml(post.excerpt)}</p>
                    ${renderTags(post.tags)}
                    <a class="blog-card__link" href="/?post=${escapeHtml(post.slug)}">Ler artigo</a>
                  </div>
                </article>
              `,
                )
                .join("")}
            </div>
          `
        }
      </section>
    `;
  } catch (error) {
    console.error(error);
    rootElement.innerHTML = `
      <section class="blog-container">
        <div class="blog-empty">
          <h2>Erro ao carregar o blog</h2>
          <p>${escapeHtml(error.message)}</p>
        </div>
      </section>
    `;
  }
}

/* RENDERIZAR ARTIGO INDIVIDUAL (PÁGINA INTERNA) */
export async function renderBlogPost(rootElement, slug) {
  rootElement.innerHTML = `
    <section class="blog-container">
      <div class="blog-empty">
        <h2>Carregando post...</h2>
        <p>Aguarde enquanto buscamos o conteúdo.</p>
      </div>
    </section>
  `;

  try {
    const post = await getPublishedPostBySlug(slug);
    document.title = `${post.title} | Blog`;

    rootElement.innerHTML = `
      <article class="blog-post">
        <a class="blog-back" href="/"> ← Voltar para o blog </a>
        <header class="blog-post__header">
          <p class="blog-eyebrow">${formatDate(post.publishedAt)}</p>
          <h1 class="blog-post__title">${escapeHtml(post.title)}</h1>
          <p class="blog-post__excerpt">${escapeHtml(post.excerpt)}</p>
          ${renderTags(post.tags)}
        </header>
        ${
          post.coverImage?.url
            ? `
            <figure class="blog-post__cover">
              <img src="${escapeHtml(post.coverImage.url)}" alt="${escapeHtml(post.title)}">
            </figure>
          `
            : ""
        }
        <div class="blog-post__content">
  ${markdownToHtml(post.content)}
</div>
      </article>
    `;
  } catch (error) {
    console.error(error);
    rootElement.innerHTML = `
      <section class="blog-container">
        <div class="blog-empty">
          <h2>Post não encontrado</h2>
          <p>O post solicitado não existe ou ainda não foi publicado.</p>
          <a class="blog-card__link" href="/">Voltar para o blog</a>
        </div>
      </section>
    `;
  }
}
