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
  const therapistSelect = document.getElementById('a_therapists');
  const therapistFeedback = document.getElementById('a_therapists_feedback');

  const refreshTherapistFeedback = () => {
    if (!therapistSelect || !therapistFeedback) return;
    const selected = Array.from(therapistSelect.selectedOptions || []);
    if (!selected.length) {
      therapistFeedback.textContent = 'No therapist selected';
      return;
    }

    const names = selected.map((opt) => opt.textContent.trim()).slice(0, 3).join(', ');
    therapistFeedback.textContent =
      selected.length <= 3 ? `Selected: ${names}` : `${selected.length} therapists selected (${names}...)`;
  };

  therapistSelect?.addEventListener('change', refreshTherapistFeedback);
  refreshTherapistFeedback();

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
      date: new Date().toISOString(),
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
  const userManageForm = document.getElementById('userManageForm');
  const msg = document.getElementById('staffMessage');
  const userSelect = document.getElementById('st_user');
  const modeLabel = document.getElementById('st_user_mode');
  const baseSalaryInput = document.getElementById('st_baseSalary');
  const commissionInput = document.getElementById('st_commission');

  function applySelectedUserMode() {
    if (!userSelect || !modeLabel || !baseSalaryInput || !commissionInput) return;

    const option = userSelect.selectedOptions?.[0];
    if (!option || !option.value) {
      modeLabel.textContent = 'Select a user to assign or update staff values.';
      return;
    }

    const staffId = option.dataset.staffId || '';
    if (staffId) {
      modeLabel.textContent = 'Update mode: this user already has a staff record.';
      baseSalaryInput.value = option.dataset.baseSalary || '0';
      commissionInput.value = option.dataset.commission || '0';
    } else {
      modeLabel.textContent = 'Create mode: this will create a new staff record for the selected user.';
      if (!baseSalaryInput.value) baseSalaryInput.value = '0';
      if (!commissionInput.value) commissionInput.value = '0';
    }
  }

  userSelect?.addEventListener('change', applySelectedUserMode);
  applySelectedUserMode();

  userManageForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(msg, false, '');

    const payload = {
      name: document.getElementById('u_name').value.trim(),
      email: document.getElementById('u_email').value.trim(),
      password: document.getElementById('u_password').value,
      roles: [document.getElementById('u_role').value],
      contactInfo: document.getElementById('u_contact').value.trim()
    };

    try {
      await api('/users', { method: 'POST', body: JSON.stringify(payload) });
      setMessage(msg, true, 'User account created.');
      await rerender();
    } catch (error) {
      setMessage(msg, false, error.message);
    }
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    setMessage(msg, false, '');

    const option = userSelect?.selectedOptions?.[0];
    const staffId = option?.dataset.staffId || '';
    const payload = {
      user: document.getElementById('st_user').value,
      baseSalary: Number(document.getElementById('st_baseSalary').value || 0),
      commissionPerSession: Number(document.getElementById('st_commission').value || 0)
    };

    try {
      if (staffId) {
        await api(`/staff/${staffId}`, { method: 'PATCH', body: JSON.stringify(payload) });
        setMessage(msg, true, 'Staff record updated.');
      } else {
        await api('/staff', { method: 'POST', body: JSON.stringify(payload) });
        setMessage(msg, true, 'Staff record created.');
      }
      await rerender();
    } catch (error) {
      setMessage(msg, false, error.message);
    }
  });
}
