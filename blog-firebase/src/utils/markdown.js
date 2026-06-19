function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function parseInlineMarkdown(text) {
  let output = escapeHtml(text);

  output = output.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  output = output.replace(/\*(.*?)\*/g, "<em>$1</em>");
  output = output.replace(/`(.*?)`/g, "<code>$1</code>");

  output = output.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  return output;
}

export function markdownToHtml(markdown) {
  const lines = String(markdown || "").split("\n");

  let html = "";
  let listOpen = false;

  function closeList() {
    if (listOpen) {
      html += "</ul>";
      listOpen = false;
    }
  }

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      closeList();
      return;
    }

    if (trimmed.startsWith("### ")) {
      closeList();
      html += `<h3>${parseInlineMarkdown(trimmed.replace("### ", ""))}</h3>`;
      return;
    }

    if (trimmed.startsWith("## ")) {
      closeList();
      html += `<h2>${parseInlineMarkdown(trimmed.replace("## ", ""))}</h2>`;
      return;
    }

    if (trimmed.startsWith("# ")) {
      closeList();
      html += `<h1>${parseInlineMarkdown(trimmed.replace("# ", ""))}</h1>`;
      return;
    }

    if (trimmed.startsWith("> ")) {
      closeList();
      html += `<blockquote>${parseInlineMarkdown(trimmed.replace("> ", ""))}</blockquote>`;
      return;
    }

    if (trimmed.startsWith("- ")) {
      if (!listOpen) {
        html += "<ul>";
        listOpen = true;
      }

      html += `<li>${parseInlineMarkdown(trimmed.replace("- ", ""))}</li>`;
      return;
    }

    closeList();
    html += `<p>${parseInlineMarkdown(trimmed)}</p>`;
  });

  closeList();

  return html;
}