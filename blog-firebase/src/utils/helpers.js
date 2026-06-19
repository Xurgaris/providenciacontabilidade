/* =========================================================
   HELPERS COMPARTILHADOS — PAINEL ADMIN
   ========================================================= */

export function escapeHtml(value) {
  const str = String(value || '');
  return str
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

export function formatDate(timestamp) {
  if (!timestamp?.toDate) return 'Sem data';

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(timestamp.toDate());
}

export function getStatusLabel(status) {
  if (status === 'published') return 'Publicado';
  return 'Rascunho';
}

export function tagsToText(tags) {
  if (!Array.isArray(tags)) return '';
  return tags.join(', ');
}