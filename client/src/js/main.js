import { api } from './api.js';

const pageTitle = document.getElementById('pageTitle');
const view = document.getElementById('view');
const logoutBtn = document.getElementById('logoutBtn');

const templates = {
  dashboard: async () => {
    const me = await api('/auth/me');
    return `
      <h3 class="text-lg font-semibold">Welcome, ${me?.user?.name || 'Staff'}</h3>
      <p class="text-muted mt-2">Roles: ${(me?.user?.roles || []).join(', ')}</p>
      <p class="mt-4 text-sm">Implementation started. Use the modules from the left navigation.</p>
    `;
  },
  patients: async () => {
    const data = await api('/patients');
    const rows = (data || [])
      .map((p) => `<tr class="border-t border-border"><td class="py-2">${p.name}</td><td>${p.phone}</td></tr>`)
      .join('');

    return `
      <div class="overflow-auto">
        <table class="w-full text-sm">
          <thead><tr class="text-left"><th class="py-2">Name</th><th>Phone</th></tr></thead>
          <tbody>${rows || '<tr><td class="py-3 text-muted" colspan="2">No records</td></tr>'}</tbody>
        </table>
      </div>
    `;
  },
  appointments: async () => '<p class="text-sm">Appointments module initialized (API ready).</p>',
  services: async () => '<p class="text-sm">Services module initialized (API ready).</p>',
  finance: async () => '<p class="text-sm">Finance module initialized (API ready).</p>'
};

async function render() {
  const route = (window.location.hash || '#dashboard').replace('#', '');
  const page = templates[route] ? route : 'dashboard';
  pageTitle.textContent = page[0].toUpperCase() + page.slice(1);
  view.innerHTML = '<div class="animate-pulse h-8 bg-surface-alt rounded"></div>';

  try {
    view.innerHTML = await templates[page]();
  } catch (error) {
    view.innerHTML = `<p class="text-red-600 text-sm">${error.message}</p>`;
  }
}

logoutBtn?.addEventListener('click', async () => {
  await api('/auth/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

window.addEventListener('hashchange', render);
render();
