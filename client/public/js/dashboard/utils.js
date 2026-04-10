import { classes } from './constants.js';

export function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function statusBadgeClass(status) {
  if (status === 'completed') {
    return 'inline-flex items-center rounded-sm border border-emerald-400 dark:border-emerald-500 px-2 py-1 text-[11px] uppercase tracking-widest font-mono font-normal text-emerald-700 dark:text-emerald-300';
  }
  if (status === 'cancelled') {
    return 'inline-flex items-center rounded-sm border border-rose-400 dark:border-rose-500 px-2 py-1 text-[11px] uppercase tracking-widest font-mono font-normal text-rose-700 dark:text-rose-300';
  }
  if (status === 'no-show') {
    return 'inline-flex items-center rounded-sm border border-amber-400 dark:border-amber-500 px-2 py-1 text-[11px] uppercase tracking-widest font-mono font-normal text-amber-700 dark:text-amber-300';
  }
  return 'inline-flex items-center rounded-sm border border-zinc-300 dark:border-zinc-700 px-2 py-1 text-[11px] uppercase tracking-widest font-mono font-normal text-zinc-600 dark:text-zinc-300';
}

export function setMessage(el, ok, text) {
  if (!el) return;
  if (!text) {
    el.className = classes.message;
    el.textContent = '';
    return;
  }
  el.className = `${classes.message} ${ok ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`;
  el.textContent = text;
}

export function selectedValues(select) {
  return Array.from(select.selectedOptions)
    .map((opt) => opt.value)
    .filter(Boolean);
}

export function selectedGender(groupName) {
  return document.querySelector(`input[name="${groupName}"]:checked`)?.value;
}

export function patientRowTemplate(p) {
  return `
    <tr>
      <td class="${classes.tableCell}">${escapeHtml(p.name)}</td>
      <td class="${classes.tableCell}">${escapeHtml(p.phone)}</td>
      <td class="${classes.tableCell}">${escapeHtml(p.gender || '-')}</td>
      <td class="${classes.tableCell}">${escapeHtml(p.age ?? '-')}</td>
      <td class="${classes.tableCell} text-right">
        <button class="${classes.actionButton}" data-action="archive-patient" data-id="${p._id}" aria-label="Archive patient">Archive</button>
      </td>
    </tr>`;
}
