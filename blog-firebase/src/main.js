import "./css/global.css";
import "./css/blog.css";
import { renderBlogList, renderBlogPost } from "./pages/blog-list.js";

const root = document.getElementById("blogRoot");
if (!root) {
  throw new Error("Elemento #blogRoot não encontrado no DOM.");
}

// Captura os parâmetros da URL (Query Strings)
const params = new URLSearchParams(window.location.search);
const postSlug = params.get("post");

// Sistema de roteamento simples baseado no parâmetro "?post="
if (postSlug) {
  renderBlogPost(root, postSlug);
} else {
  renderBlogList(root);
}