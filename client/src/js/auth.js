import { api } from './api.js';

const form = document.getElementById('loginForm');
const errorEl = document.getElementById('error');

form?.addEventListener('submit', async (event) => {
  event.preventDefault();

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
  }
});
