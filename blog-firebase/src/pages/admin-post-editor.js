import {
  createPost,
  updatePost
} from "../services/posts.service.js";

import { uploadBlogCover } from "../services/cloudinary.service.js";
import { slugify } from "../utils/slugify.js";
import { escapeHtml, tagsToText } from "../utils/helpers.js";

function renderCoverPreview(coverImage) {
  if (!coverImage?.url) {
    return `
      <div class="cover-empty">
        Nenhuma imagem de capa enviada ainda.
      </div>
    `;
  }

  return `
    <div class="cover-preview">
      <img src="${escapeHtml(coverImage.url)}" alt="Imagem de capa">
    </div>
  `;
}

export function renderPostEditor(rootElement, options) {
  const user = options.user;
  const post = options.post || null;
  const onBack = options.onBack;
  const onSaved = options.onSaved;

  const isEditing = Boolean(post && post.id);
  let currentCoverImage = post?.coverImage || null;

  rootElement.innerHTML = `
   <section class="admin-editor">
    <header class="admin-section-header">
      <div>
        <p class="admin-eyebrow">${isEditing ? "Editar post" : "Novo post"}</p>

        <h2 class="admin-heading">
          ${isEditing ? "Editar conteúdo" : "Criar novo conteúdo"}
        </h2>
      </div>

      <button class="admin-secondary-button" id="backToPosts" type="button">
        Voltar
      </button>
    </header>

    <form class="post-form" id="postForm">
      <div class="cover-upload-box">
        <div>
          <p class="admin-eyebrow">Imagem de capa</p>

          <h3>Enviar imagem do post</h3>

          <p>
            Selecione uma imagem JPG, PNG ou WEBP. Tamanho máximo recomendado: 5MB.
          </p>
        </div>

        <div id="coverPreviewArea">
          ${renderCoverPreview(currentCoverImage)}
        </div>

        <div class="cover-actions">
          <input
            type="file"
            id="coverInput"
            accept="image/jpeg,image/png,image/webp"
            hidden
          />

          <button class="admin-secondary-button" id="selectCoverButton" type="button">
            Escolher imagem
          </button>

          <button class="admin-danger-button" id="removeCoverButton" type="button">
            Remover imagem
          </button>
        </div>

        <p class="admin-message" id="coverMessage"></p>
      </div>

      <div class="post-form__grid">
        <label class="admin-label">
          Título do post

          <input
            class="admin-input"
            type="text"
            id="postTitle"
            placeholder="Ex: Como abrir uma empresa sem burocracia"
            value="${escapeHtml(post ? post.title : "")}"
            required
          />
        </label>

        <label class="admin-label">
          Slug da URL

          <input
            class="admin-input"
            type="text"
            id="postSlug"
            placeholder="como-abrir-uma-empresa"
            value="${escapeHtml(post ? post.slug : "")}"
          />
        </label>
      </div>

      <label class="admin-label">
        Resumo curto

        <textarea
          class="admin-textarea small"
          id="postExcerpt"
          placeholder="Escreva um resumo curto para aparecer no card do blog."
          required
        >${escapeHtml(post ? post.excerpt : "")}</textarea>
      </label>

      <label class="admin-label">
        Conteúdo completo

        <div class="editor-toolbar">
          <button type="button" class="editor-tool" data-format="h2">
            Título
          </button>

          <button type="button" class="editor-tool" data-format="bold">
            Negrito
          </button>

          <button type="button" class="editor-tool" data-format="italic">
            Itálico
          </button>

          <button type="button" class="editor-tool" data-format="list">
            Lista
          </button>

          <button type="button" class="editor-tool" data-format="quote">
            Citação
          </button>

          <button type="button" class="editor-tool" data-format="link">
            Link
          </button>

          <button type="button" class="editor-tool" data-format="code">
            Código
          </button>
        </div>

        <textarea
          class="admin-textarea large"
          id="postContent"
          placeholder="Escreva o conteúdo completo do post aqui."
          required
        >${escapeHtml(post ? post.content : "")}</textarea>

        <small class="editor-help">
          Use os botões acima para formatar o texto. O conteúdo será exibido formatado no blog.
        </small>
      </label>

      <div class="post-form__grid">
        <label class="admin-label">
          Tags

          <input
            class="admin-input"
            type="text"
            id="postTags"
            placeholder="contabilidade, empresas, impostos"
            value="${escapeHtml(tagsToText(post ? post.tags : []))}"
          />
        </label>

        <label class="admin-label">
          Status

          <select class="admin-input" id="postStatus">
            <option value="draft" ${!post || post.status !== "published" ? "selected" : ""}>
              Rascunho
            </option>

            <option value="published" ${post && post.status === "published" ? "selected" : ""}>
              Publicado
            </option>
          </select>
        </label>
      </div>

      <div class="post-form__actions">
        <button class="admin-button" id="savePostButton" type="submit">
          ${isEditing ? "Salvar alterações" : "Criar post"}
        </button>

        <p class="admin-message" id="postMessage"></p>
      </div>
    </form>
  </section>
  `;

  const backButton = document.getElementById("backToPosts");
  const form = document.getElementById("postForm");

  const titleInput = document.getElementById("postTitle");
  const slugInput = document.getElementById("postSlug");
  const excerptInput = document.getElementById("postExcerpt");
  const contentInput = document.getElementById("postContent");
  const tagsInput = document.getElementById("postTags");
  const statusInput = document.getElementById("postStatus");

  const saveButton = document.getElementById("savePostButton");
  const message = document.getElementById("postMessage");

  const coverInput = document.getElementById("coverInput");
  const selectCoverButton = document.getElementById("selectCoverButton");
  const removeCoverButton = document.getElementById("removeCoverButton");
  const coverMessage = document.getElementById("coverMessage");
  const coverPreviewArea = document.getElementById("coverPreviewArea");
  const editorButtons = document.querySelectorAll(".editor-tool");

function insertTextAtCursor(textarea, before, after = "") {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = textarea.value.substring(start, end);
  const replacement = before + selectedText + after;

  textarea.value =
    textarea.value.substring(0, start) +
    replacement +
    textarea.value.substring(end);

  textarea.focus();

  const cursorPosition = start + before.length + selectedText.length;
  textarea.setSelectionRange(cursorPosition, cursorPosition);
}

function insertLineFormat(textarea, prefix) {
  const start = textarea.selectionStart;
  const value = textarea.value;
  const lineStart = value.lastIndexOf("\n", start - 1) + 1;

  textarea.value =
    value.substring(0, lineStart) +
    prefix +
    value.substring(lineStart);

  textarea.focus();
  textarea.setSelectionRange(start + prefix.length, start + prefix.length);
}

editorButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const format = button.dataset.format;

    if (format === "h2") {
      insertLineFormat(contentInput, "## ");
    }

    if (format === "bold") {
      insertTextAtCursor(contentInput, "**", "**");
    }

    if (format === "italic") {
      insertTextAtCursor(contentInput, "*", "*");
    }

    if (format === "list") {
      insertLineFormat(contentInput, "- ");
    }

    if (format === "quote") {
      insertLineFormat(contentInput, "> ");
    }

    if (format === "link") {
      const url = prompt("Cole a URL do link:");

      if (!url) return;

      insertTextAtCursor(contentInput, "[", `](${url})`);
    }

    if (format === "code") {
      insertTextAtCursor(contentInput, "`", "`");
    }
  });
});

  function updateCoverPreview() {
    coverPreviewArea.innerHTML = renderCoverPreview(currentCoverImage);
  }

  if (!isEditing) {
    titleInput.addEventListener("input", function () {
      slugInput.value = slugify(titleInput.value);
    });
  }

  backButton.addEventListener("click", function () {
    onBack();
  });

  selectCoverButton.addEventListener("click", function () {
    coverInput.click();
  });

  removeCoverButton.addEventListener("click", function () {
    currentCoverImage = null;
    coverMessage.textContent = "Imagem removida do post. Salve para aplicar.";
    updateCoverPreview();
  });

  coverInput.addEventListener("change", async function () {
    const file = coverInput.files[0];

    if (!file) return;

    coverMessage.textContent = "";
    selectCoverButton.disabled = true;
    selectCoverButton.textContent = "Enviando...";

    try {
      currentCoverImage = await uploadBlogCover(file);

      coverMessage.textContent = "Imagem enviada com sucesso.";
      updateCoverPreview();
    } catch (error) {
      console.error(error);
      coverMessage.textContent = error.message || "Erro ao enviar imagem.";
    } finally {
      selectCoverButton.disabled = false;
      selectCoverButton.textContent = "Escolher imagem";
      coverInput.value = "";
    }
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    message.textContent = "";
    saveButton.disabled = true;
    saveButton.textContent = "Salvando...";

    const postData = {
      title: titleInput.value,
      slug: slugInput.value,
      excerpt: excerptInput.value,
      content: contentInput.value,
      tags: tagsInput.value,
      status: statusInput.value,
      coverImage: currentCoverImage
    };

    try {
      if (isEditing) {
        await updatePost(post.id, postData);
      } else {
        await createPost(postData, user);
      }

      onSaved();
    } catch (error) {
      console.error(error);

      message.textContent = error.message || "Erro ao salvar post.";
      saveButton.disabled = false;
      saveButton.textContent = isEditing ? "Salvar alterações" : "Criar post";
    }
  });
}