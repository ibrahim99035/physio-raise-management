import { api } from './api.js';

const form = document.getElementById('loginForm');
const errorEl = document.getElementById('error');
const loginThemeToggle = document.getElementById('loginThemeToggle');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');

function setLoginLoading(isLoading) {
  if (!loginSubmitBtn) return;
  loginSubmitBtn.disabled = isLoading;
  loginSubmitBtn.textContent = isLoading ? 'Logging in...' : 'Login';
}

function setTheme(theme) {
  const isDark = theme === 'dark';
  document.documentElement.classList.toggle('dark', isDark);
  localStorage.setItem('physion-theme', theme);
  if (loginThemeToggle) {
    loginThemeToggle.textContent = isDark ? '☀️' : '🌙';
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

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorEl.textContent = '';
  setLoginLoading(true);

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  try {
    await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });

    window.location.href = '/';
  } catch (error) {
    errorEl.textContent = error.message;
  } finally {
    setLoginLoading(false);
  }
});

loginThemeToggle?.addEventListener('click', () => {
  const isDark = document.documentElement.classList.contains('dark');
  setTheme(isDark ? 'light' : 'dark');
});

initTheme();
