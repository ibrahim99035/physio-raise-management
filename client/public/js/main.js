import { api } from './api.js';
import { classes, navClass, routeRoles } from './dashboard/constants.js';
import { createTemplates } from './dashboard/templates.js';
import {
  wireAppointmentsHandlers,
  wireFinanceHandlers,
  wireGenericRowActions,
  wirePatientsHandlers,
  wireServicesHandlers,
  wireStaffHandlers
} from './dashboard/handlers.js';
const pageTitle = document.getElementById('pageTitle');
const view = document.getElementById('view');
const logoutBtn = document.getElementById('logoutBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');
const sessionUserMeta = document.getElementById('sessionUserMeta');
const footerYear = document.getElementById('footerYear');
const navLinks = Array.from(document.querySelectorAll('a[data-route]'));

let currentUser = null;
let rowActionsBound = false;

const templates = createTemplates(api, () => currentUser);

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('physion-theme', theme);
  if (themeToggleBtn) {
    themeToggleBtn.textContent = isDark ? '☀️ Light Mode' : '🌙 Dark Mode';
  }
}

function initTheme() {
  const stored = localStorage.getItem('physion-theme');
  if (stored === 'dark' || stored === 'light') {
    setTheme(stored);
    return;
  }

  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  setTheme(prefersDark ? 'dark' : 'light');
}

function updateActiveNav(page) {
  for (const link of navLinks) {
    const active = link.dataset.route === page;
    link.className = `${navClass.base} ${active ? navClass.active : navClass.idle}`;
  }
}

function updateHeaderMeta() {
  if (!sessionUserMeta) return;
  sessionUserMeta.textContent = `${currentUser?.name || 'Staff'} • ${(currentUser?.roles || []).join(', ')}`;
}

function hasAnyRole(allowedRoles) {
  const userRoles = currentUser?.roles || [];
  return allowedRoles.some((role) => userRoles.includes(role));
}

function isRouteAllowed(route) {
  const allowedRoles = routeRoles[route] || [];
  return hasAnyRole(allowedRoles);
}

function firstAllowedRoute() {
  const routes = Object.keys(routeRoles);
  return routes.find((route) => isRouteAllowed(route)) || 'dashboard';
}

function applyRoleGuardToSidebar() {
  for (const link of navLinks) {
    const route = link.dataset.route;
    if (!route) continue;
    link.classList.toggle('hidden', !isRouteAllowed(route));
  }
}

async function render() {
  const route = (window.location.hash || '#dashboard').replace('#', '');
  const resolved = templates[route] ? route : 'dashboard';
  let page = resolved;

  try {
    if (!currentUser) {
      const me = await api('/auth/me');
      currentUser = me?.user || null;
      applyRoleGuardToSidebar();
    }

    page = isRouteAllowed(resolved) ? resolved : firstAllowedRoute();
    if (page !== resolved) {
      window.location.hash = `#${page}`;
    }

    updateActiveNav(page);
    updateHeaderMeta();

    pageTitle.textContent = page[0].toUpperCase() + page.slice(1);
    view.innerHTML = '<div class="animate-pulse h-8 bg-zinc-100 dark:bg-zinc-800 rounded-sm"></div>';

    view.innerHTML = await templates[page]();

    if (page === 'patients') wirePatientsHandlers(api, render);
    if (page === 'appointments') wireAppointmentsHandlers(api, render);
    if (page === 'services') wireServicesHandlers(api, render);
    if (page === 'staff') wireStaffHandlers(api, render);
    if (page === 'finance') wireFinanceHandlers(api, render);

    if (!rowActionsBound) {
      wireGenericRowActions(view, api, render);
      rowActionsBound = true;
    }
  } catch (error) {
    view.innerHTML = `<p class="${classes.message} text-rose-600 dark:text-rose-400">${error.message}</p>`;
  }
}

logoutBtn?.addEventListener('click', async () => {
  await api('/auth/logout', { method: 'POST' });
  window.location.href = '/login.html';
});

themeToggleBtn?.addEventListener('click', () => {
  const isDark = document.documentElement.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
});

if (footerYear) {
  footerYear.textContent = `© ${new Date().getFullYear()} Physion`;
}

initTheme();
window.addEventListener('hashchange', render);
render();
