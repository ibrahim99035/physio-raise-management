import { classes } from './constants.js';
import { patientRowTemplate, selectedGender, selectedValues, setMessage } from './utils.js';

async function loadPatients(api, q = '') {
  const query = q ? `?q=${encodeURIComponent(q)}` : '';
  return api(`/patients${query}`);
}

export function wirePatientsHandlers(api, rerender) {
  const createForm = document.getElementById('patientCreateForm');
  const searchInput = document.getElementById('patientSearch');
  const tableBody = document.getElementById('patientsTableBody');
  const msg = document.getElementById('patientsMessage');

  createForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(msg, false, '');

    const payload = {
      name: document.getElementById('p_name').value.trim(),
      phone: document.getElementById('p_phone').value.trim(),
      gender: selectedGender('p_gender') || undefined,
      age: document.getElementById('p_age').value ? Number(document.getElementById('p_age').value) : undefined,
      medicalHistory: document.getElementById('p_history').value.trim()
    };

    try {
      await api('/patients', { method: 'POST', body: JSON.stringify(payload) });
      setMessage(msg, true, 'Patient created.');
      await refreshPatientsTable('');
      createForm.reset();
    } catch (error) {
      setMessage(msg, false, error.message);
    }
  });

  async function refreshPatientsTable(q) {
    const data = await loadPatients(api, q);
    tableBody.innerHTML = (data || []).map(patientRowTemplate).join('');
    if (!tableBody.innerHTML) {
      tableBody.innerHTML = `<tr><td class="${classes.tableCell}" colspan="5">No records</td></tr>`;
    }
  }

  let searchTimer;
  searchInput?.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(async () => {
      try {
        await refreshPatientsTable(searchInput.value.trim());
      } catch (error) {
        setMessage(msg, false, error.message);
      }
    }, 250);
  });
}

export function wireAppointmentsHandlers(api, rerender) {
  const form = document.getElementById('appointmentForm');
  const inlineBtn = document.getElementById('openInlinePatient');
  const inlineForm = document.getElementById('inlinePatientForm');
  const msg = document.getElementById('appointmentsMessage');

  inlineBtn?.addEventListener('click', () => {
    inlineForm?.classList.toggle('hidden');
  });

  inlineForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(msg, false, '');

    const payload = {
      name: document.getElementById('ip_name').value.trim(),
      phone: document.getElementById('ip_phone').value.trim(),
      gender: selectedGender('ip_gender') || undefined
    };

    try {
      const created = await api('/patients', { method: 'POST', body: JSON.stringify(payload) });
      setMessage(msg, true, 'Inline patient created. Refreshing appointments view...');
      await rerender();

      const patientSelect = document.getElementById('a_patient');
      if (patientSelect && created?._id) {
        patientSelect.value = created._id;
      }
    } catch (error) {
      setMessage(msg, false, error.message);
    }
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(msg, false, '');

    const therapistSelect = document.getElementById('a_therapists');
    const startsAtRaw = document.getElementById('a_startsAt').value;
    const payload = {
      patient: document.getElementById('a_patient').value,
      service: document.getElementById('a_service').value,
      therapists: selectedValues(therapistSelect),
      startsAt: new Date(startsAtRaw).toISOString(),
      durationMinutes: Number(document.getElementById('a_duration').value || 60),
      status: document.getElementById('a_status').value,
      notes: document.getElementById('a_notes').value.trim()
    };

    try {
      await api('/appointments', { method: 'POST', body: JSON.stringify(payload) });
      setMessage(msg, true, 'Appointment created.');
      await rerender();
    } catch (error) {
      setMessage(msg, false, error.message);
    }
  });
}

export function wireServicesHandlers(api, rerender) {
  const form = document.getElementById('serviceForm');
  const msg = document.getElementById('servicesMessage');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(msg, false, '');

    const payload = {
      name: document.getElementById('s_name').value.trim(),
      price: Number(document.getElementById('s_price').value || 0)
    };

    try {
      await api('/services', { method: 'POST', body: JSON.stringify(payload) });
      setMessage(msg, true, 'Service created.');
      await rerender();
    } catch (error) {
      setMessage(msg, false, error.message);
    }
  });
}

export function wireFinanceHandlers(api, rerender) {
  const form = document.getElementById('expenseForm');
  const msg = document.getElementById('financeMessage');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(msg, false, '');

    const payload = {
      title: document.getElementById('e_title').value.trim(),
      amount: Number(document.getElementById('e_amount').value || 0),
      category: document.getElementById('e_category').value.trim(),
      date: new Date(document.getElementById('e_date').value).toISOString(),
      notes: document.getElementById('e_notes').value.trim()
    };

    try {
      await api('/finance/expenses', { method: 'POST', body: JSON.stringify(payload) });
      setMessage(msg, true, 'Expense created.');
      await rerender();
    } catch (error) {
      setMessage(msg, false, error.message);
    }
  });
}

export function wireGenericRowActions(view, api, rerender) {
  view.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;

    const action = target.dataset.action;
    const id = target.dataset.id;
    if (!action || !id) return;

    if (action === 'archive-patient') {
      await api(`/patients/${id}`, { method: 'DELETE' });
      await rerender();
    }

    if (action === 'archive-appointment') {
      await api(`/appointments/${id}`, { method: 'DELETE' });
      await rerender();
    }

    if (action === 'archive-service') {
      await api(`/services/${id}`, { method: 'DELETE' });
      await rerender();
    }

    if (action === 'archive-expense') {
      await api(`/finance/expenses/${id}`, { method: 'DELETE' });
      await rerender();
    }

    if (action === 'archive-staff') {
      await api(`/staff/${id}`, { method: 'DELETE' });
      await rerender();
    }
  });
}

export function wireStaffHandlers(api, rerender) {
  const form = document.getElementById('staffForm');
  const msg = document.getElementById('staffMessage');

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(msg, false, '');

    const payload = {
      user: document.getElementById('st_user').value,
      baseSalary: Number(document.getElementById('st_baseSalary').value || 0),
      commissionPerSession: Number(document.getElementById('st_commission').value || 0)
    };

    try {
      await api('/staff', { method: 'POST', body: JSON.stringify(payload) });
      setMessage(msg, true, 'Staff record created.');
      await rerender();
    } catch (error) {
      setMessage(msg, false, error.message);
    }
  });
}
