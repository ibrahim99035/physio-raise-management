import { classes } from './constants.js';
import { escapeHtml, patientRowTemplate, statusBadgeClass } from './utils.js';

async function renderDashboard(api, getCurrentUser) {
  const [patients, appointments, services, monthly] = await Promise.all([
    api('/patients'),
    api('/appointments'),
    api('/services'),
    api('/finance/summary/monthly')
  ]);

  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const appointmentsList = appointments || [];
  const todayAppointments = appointmentsList.filter((a) => {
    const d = new Date(a.startsAt);
    return d >= todayStart && d <= todayEnd;
  });
  const upcoming = appointmentsList
    .filter((a) => new Date(a.startsAt) >= now && a.status === 'scheduled')
    .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
    .slice(0, 5);

  const upcomingRows = upcoming
    .map(
      (a) => `
      <tr>
        <td class="${classes.tableCell}">${escapeHtml(a.patient?.name || '-')}</td>
        <td class="${classes.tableCell}">${escapeHtml(a.service?.name || '-')}</td>
        <td class="${classes.tableCell}">${new Date(a.startsAt).toLocaleString()}</td>
        <td class="${classes.tableCell}"><span class="${statusBadgeClass(a.status)}">${escapeHtml(a.status)}</span></td>
      </tr>`
    )
    .join('');

  return `
    <div class="space-y-4">
      <div class="${classes.card} border-l-2 border-l-violet-500 dark:border-l-violet-400">
        <h3 class="${classes.heading}">Welcome, ${getCurrentUser()?.name || 'Staff'}</h3>
        <p class="mt-2 text-[11px] uppercase tracking-widest font-mono font-normal text-zinc-400 dark:text-zinc-500">Roles: ${(getCurrentUser()?.roles || []).join(', ')}</p>
        <p class="mt-4 text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100">Dashboard shows quick clinic KPIs, today’s schedule, and upcoming appointments.</p>
      </div>

      <div class="grid md:grid-cols-4 gap-3">
        <div class="${classes.card} border-l-2 border-l-emerald-500 dark:border-l-emerald-400"><p class="text-[11px] uppercase tracking-widest font-mono font-normal text-zinc-400 dark:text-zinc-500">Patients</p><p class="text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100 mt-1">${(patients || []).length}</p></div>
        <div class="${classes.card} border-l-2 border-l-amber-500 dark:border-l-amber-400"><p class="text-[11px] uppercase tracking-widest font-mono font-normal text-zinc-400 dark:text-zinc-500">Today's Appointments</p><p class="text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100 mt-1">${todayAppointments.length}</p></div>
        <div class="${classes.card} border-l-2 border-l-fuchsia-500 dark:border-l-fuchsia-400"><p class="text-[11px] uppercase tracking-widest font-mono font-normal text-zinc-400 dark:text-zinc-500">Services</p><p class="text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100 mt-1">${(services || []).length}</p></div>
        <div class="${classes.card} border-l-2 border-l-blue-500 dark:border-l-blue-400"><p class="text-[11px] uppercase tracking-widest font-mono font-normal text-zinc-400 dark:text-zinc-500">Monthly Profit</p><p class="text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100 mt-1">${monthly?.profit ?? 0}</p></div>
      </div>

      <div class="${classes.card} border-l-2 border-l-violet-500 dark:border-l-violet-400">
        <h3 class="${classes.heading} mb-3">Upcoming Appointments</h3>
        <div class="${classes.tableWrap}">
          <table class="w-full">
            <thead>
              <tr class="text-left">
                <th class="${classes.tableHead}">Patient</th>
                <th class="${classes.tableHead}">Service</th>
                <th class="${classes.tableHead}">Date</th>
                <th class="${classes.tableHead}">Status</th>
              </tr>
            </thead>
            <tbody>${upcomingRows || `<tr><td class="${classes.tableCell}" colspan="4">No upcoming appointments</td></tr>`}</tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

async function renderPatients(api) {
  const patients = await api('/patients');
  const rows = (patients || []).map(patientRowTemplate).join('');

  return `
    <div class="space-y-4">
      <div class="${classes.card} border-l-2 border-l-emerald-500 dark:border-l-emerald-400">
        <div class="flex flex-col md:flex-row gap-2 md:items-end md:justify-between">
          <div>
            <label class="${classes.label}" for="patientSearch">Search patients</label>
            <input id="patientSearch" class="${classes.field} md:w-80" placeholder="Name or phone" aria-label="Search patients" />
          </div>
        </div>
        <form id="patientCreateForm" class="mt-4 grid md:grid-cols-5 gap-3 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <div class="md:col-span-2">
            <label class="${classes.label}" for="p_name">Name</label>
            <input id="p_name" class="${classes.field}" required aria-label="Patient name" autocomplete="name" />
          </div>
          <div>
            <label class="${classes.label}" for="p_phone">Phone</label>
            <input id="p_phone" class="${classes.field}" required aria-label="Patient phone" inputmode="tel" autocomplete="tel" />
          </div>
          <div>
            <label class="${classes.label}">Gender</label>
            <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Patient gender">
              <label class="flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 rounded-sm px-3 py-2 text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100">
                <input class="accent-zinc-900 dark:accent-zinc-100" type="radio" name="p_gender" value="male" checked />
                <span>Male</span>
              </label>
              <label class="flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 rounded-sm px-3 py-2 text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100">
                <input class="accent-zinc-900 dark:accent-zinc-100" type="radio" name="p_gender" value="female" />
                <span>Female</span>
              </label>
            </div>
          </div>
          <div>
            <label class="${classes.label}" for="p_age">Age</label>
            <input id="p_age" type="number" min="0" max="120" class="${classes.field}" aria-label="Patient age" />
          </div>
          <div class="md:col-span-5">
            <label class="${classes.label}" for="p_history">Medical history</label>
            <textarea id="p_history" class="${classes.field} min-h-20" aria-label="Patient medical history"></textarea>
          </div>
          <div class="md:col-span-5 flex justify-end">
            <button class="${classes.button}" type="submit" aria-label="Create patient">Create Patient</button>
          </div>
        </form>
      </div>

      <div class="${classes.card} border-l-2 border-l-violet-500 dark:border-l-violet-400">
        <div class="${classes.tableWrap}">
          <table class="w-full">
            <thead>
              <tr class="text-left">
                <th class="${classes.tableHead}">Name</th>
                <th class="${classes.tableHead}">Phone</th>
                <th class="${classes.tableHead}">Gender</th>
                <th class="${classes.tableHead}">Age</th>
                <th class="${classes.tableHead} text-right">Actions</th>
              </tr>
            </thead>
            <tbody id="patientsTableBody">${rows || `<tr><td class="${classes.tableCell}" colspan="5">No records</td></tr>`}</tbody>
          </table>
        </div>
        <p id="patientsMessage" class="${classes.message}"></p>
      </div>
    </div>
  `;
}

async function renderAppointments(api) {
  const [appointments, patients, services, therapists] = await Promise.all([
    api('/appointments'),
    api('/patients'),
    api('/services'),
    api('/users/therapists')
  ]);

  const patientOptions = (patients || []).map((p) => `<option value="${p._id}">${escapeHtml(p.name)} • ${escapeHtml(p.phone)}</option>`).join('');
  const serviceOptions = (services || []).map((s) => `<option value="${s._id}">${escapeHtml(s.name)} • ${s.price}</option>`).join('');
  const therapistOptions = (therapists || []).map((t) => `<option value="${t._id}">${escapeHtml(t.name)}</option>`).join('');

  const rows = (appointments || [])
    .map(
      (a) => `
      <tr>
        <td class="${classes.tableCell}">${escapeHtml(a.patient?.name || '-')}</td>
        <td class="${classes.tableCell}">${escapeHtml(a.service?.name || '-')}</td>
        <td class="${classes.tableCell}">${escapeHtml((a.therapists || []).map((t) => t.name).join(', ') || '-')}</td>
        <td class="${classes.tableCell}">${new Date(a.startsAt).toLocaleString()}</td>
        <td class="${classes.tableCell}"><span class="${statusBadgeClass(a.status)}">${escapeHtml(a.status)}</span></td>
        <td class="${classes.tableCell} text-right"><button data-action="archive-appointment" data-id="${a._id}" class="${classes.actionButton}" aria-label="Archive appointment">Archive</button></td>
      </tr>`
    )
    .join('');

  return `
    <div class="space-y-4">
      <form id="appointmentForm" class="${classes.card} border-l-2 border-l-amber-500 dark:border-l-amber-400 grid md:grid-cols-2 gap-3">
        <div>
          <label class="${classes.label}" for="a_patient">Patient</label>
          <select id="a_patient" class="${classes.selectField}" required aria-label="Appointment patient">
            <option value="">Select patient</option>
            ${patientOptions}
          </select>
        </div>
        <div>
          <label class="${classes.label}" for="a_service">Service</label>
          <select id="a_service" class="${classes.selectField}" required aria-label="Appointment service">
            <option value="">Select service</option>
            ${serviceOptions}
          </select>
        </div>
        <div>
          <label class="${classes.label}" for="a_therapists">Assigned Therapist(s)</label>
          <select id="a_therapists" class="${classes.selectField} min-h-24" required multiple size="6" aria-label="Appointment therapists">
            ${therapistOptions}
          </select>
          <p class="mt-1 text-[11px] uppercase tracking-widest font-mono font-normal text-zinc-400 dark:text-zinc-500">Hold Ctrl/Cmd to select multiple therapists.</p>
          <p id="a_therapists_feedback" class="mt-1 text-[11px] uppercase tracking-widest font-mono font-normal text-zinc-500 dark:text-zinc-400">No therapist selected</p>
        </div>
        <div class="space-y-3">
          <div>
            <label class="${classes.label}" for="a_startsAt">Date and time</label>
            <input id="a_startsAt" type="datetime-local" class="${classes.field}" required aria-label="Appointment start date and time" />
          </div>
          <div>
            <label class="${classes.label}" for="a_duration">Duration (minutes)</label>
            <input id="a_duration" type="number" class="${classes.field}" value="60" min="15" step="15" required aria-label="Appointment duration" />
          </div>
          <div>
            <label class="${classes.label}" for="a_status">Status</label>
            <select id="a_status" class="${classes.selectField}" aria-label="Appointment status">
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="no-show">No-show</option>
            </select>
          </div>
        </div>
        <div class="md:col-span-2">
          <label class="${classes.label}" for="a_notes">Notes</label>
          <textarea id="a_notes" class="${classes.field} min-h-20" aria-label="Appointment notes"></textarea>
        </div>
        <div class="md:col-span-2 flex justify-between items-center gap-3">
          <button type="button" id="openInlinePatient" class="${classes.button}" aria-label="Open inline patient form">New patient inline</button>
          <button type="submit" class="${classes.button}" aria-label="Create appointment">Create Appointment</button>
        </div>
      </form>

      <form id="inlinePatientForm" class="hidden ${classes.card} border-l-2 border-l-emerald-500 dark:border-l-emerald-400 grid md:grid-cols-4 gap-3">
        <div>
          <label class="${classes.label}" for="ip_name">Patient name</label>
          <input id="ip_name" class="${classes.field}" aria-label="Inline patient name" autocomplete="name" />
        </div>
        <div>
          <label class="${classes.label}" for="ip_phone">Phone</label>
          <input id="ip_phone" class="${classes.field}" aria-label="Inline patient phone" inputmode="tel" autocomplete="tel" />
        </div>
        <div>
          <label class="${classes.label}">Gender</label>
          <div class="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Inline patient gender">
            <label class="flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 rounded-sm px-3 py-2 text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100">
              <input class="accent-zinc-900 dark:accent-zinc-100" type="radio" name="ip_gender" value="male" checked />
              <span>Male</span>
            </label>
            <label class="flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 rounded-sm px-3 py-2 text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100">
              <input class="accent-zinc-900 dark:accent-zinc-100" type="radio" name="ip_gender" value="female" />
              <span>Female</span>
            </label>
          </div>
        </div>
        <div class="flex items-end">
          <button type="submit" class="${classes.button} w-full" aria-label="Create inline patient">Create Patient</button>
        </div>
      </form>

      <div class="${classes.card} border-l-2 border-l-violet-500 dark:border-l-violet-400">
        <div class="${classes.tableWrap}">
          <table class="w-full">
            <thead>
              <tr class="text-left">
                <th class="${classes.tableHead}">Patient</th>
                <th class="${classes.tableHead}">Service</th>
                <th class="${classes.tableHead}">Therapists</th>
                <th class="${classes.tableHead}">Date</th>
                <th class="${classes.tableHead}">Status</th>
                <th class="${classes.tableHead} text-right">Actions</th>
              </tr>
            </thead>
            <tbody>${rows || `<tr><td class="${classes.tableCell}" colspan="6">No records</td></tr>`}</tbody>
          </table>
        </div>
      </div>
      <p id="appointmentsMessage" class="${classes.message}"></p>
    </div>
  `;
}

async function renderServices(api) {
  const services = await api('/services');
  const rows = (services || [])
    .map(
      (s) => `
      <tr>
        <td class="${classes.tableCell}">${escapeHtml(s.name)}</td>
        <td class="${classes.tableCell}">${escapeHtml(s.price)}</td>
        <td class="${classes.tableCell} text-right"><button data-action="archive-service" data-id="${s._id}" class="${classes.actionButton}" aria-label="Archive service">Archive</button></td>
      </tr>`
    )
    .join('');

  return `
    <div class="space-y-4">
      <form id="serviceForm" class="${classes.card} border-l-2 border-l-fuchsia-500 dark:border-l-fuchsia-400 grid md:grid-cols-3 gap-3">
        <div>
          <label class="${classes.label}" for="s_name">Service name</label>
          <input id="s_name" class="${classes.field}" required aria-label="Service name" />
        </div>
        <div>
          <label class="${classes.label}" for="s_price">Price</label>
          <input id="s_price" type="number" min="0" step="0.01" class="${classes.field}" required aria-label="Service price" />
        </div>
        <div class="flex items-end">
          <button class="${classes.button} w-full" type="submit" aria-label="Create service">Create Service</button>
        </div>
      </form>

      <div class="${classes.card} border-l-2 border-l-violet-500 dark:border-l-violet-400">
        <div class="${classes.tableWrap}">
          <table class="w-full">
            <thead><tr class="text-left"><th class="${classes.tableHead}">Name</th><th class="${classes.tableHead}">Price</th><th class="${classes.tableHead} text-right">Actions</th></tr></thead>
            <tbody>${rows || `<tr><td class="${classes.tableCell}" colspan="3">No records</td></tr>`}</tbody>
          </table>
        </div>
      </div>
      <p id="servicesMessage" class="${classes.message}"></p>
    </div>
  `;
}

async function renderFinance(api) {
  const [expenses, monthly] = await Promise.all([api('/finance/expenses'), api('/finance/summary/monthly')]);

  const rows = (expenses || [])
    .map(
      (e) => `
      <tr>
        <td class="${classes.tableCell}">${escapeHtml(e.title)}</td>
        <td class="${classes.tableCell}">${escapeHtml(e.category)}</td>
        <td class="${classes.tableCell}">${escapeHtml(e.amount)}</td>
        <td class="${classes.tableCell}">${new Date(e.date).toLocaleDateString()}</td>
        <td class="${classes.tableCell} text-right"><button data-action="archive-expense" data-id="${e._id}" class="${classes.actionButton}" aria-label="Archive expense">Archive</button></td>
      </tr>`
    )
    .join('');

  return `
    <div class="space-y-4">
      <div class="grid md:grid-cols-3 gap-3">
        <div class="${classes.card} border-l-2 border-l-emerald-500 dark:border-l-emerald-400"><p class="text-[11px] uppercase tracking-widest font-mono font-normal text-zinc-400 dark:text-zinc-500">Revenue</p><p class="text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100 mt-1">${monthly?.revenue ?? 0}</p></div>
        <div class="${classes.card} border-l-2 border-l-amber-500 dark:border-l-amber-400"><p class="text-[11px] uppercase tracking-widest font-mono font-normal text-zinc-400 dark:text-zinc-500">Expenses</p><p class="text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100 mt-1">${monthly?.expenses ?? 0}</p></div>
        <div class="${classes.card} border-l-2 border-l-violet-500 dark:border-l-violet-400"><p class="text-[11px] uppercase tracking-widest font-mono font-normal text-zinc-400 dark:text-zinc-500">Profit</p><p class="text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100 mt-1">${monthly?.profit ?? 0}</p></div>
      </div>

      <form id="expenseForm" class="${classes.card} border-l-2 border-l-rose-500 dark:border-l-rose-400 grid md:grid-cols-5 gap-3">
        <div class="md:col-span-2">
          <label class="${classes.label}" for="e_title">Title</label>
          <input id="e_title" class="${classes.field}" required aria-label="Expense title" />
        </div>
        <div>
          <label class="${classes.label}" for="e_amount">Amount</label>
          <input id="e_amount" type="number" min="0" step="0.01" class="${classes.field}" required aria-label="Expense amount" />
        </div>
        <div>
          <label class="${classes.label}" for="e_category">Category</label>
          <input id="e_category" class="${classes.field}" required aria-label="Expense category" />
        </div>
        <div>
          <label class="${classes.label}" for="e_date_display">Date</label>
          <input id="e_date_display" type="text" class="${classes.field}" value="Auto (today)" readonly aria-label="Expense date auto" />
        </div>
        <div class="md:col-span-5">
          <label class="${classes.label}" for="e_notes">Notes</label>
          <textarea id="e_notes" class="${classes.field} min-h-20" aria-label="Expense notes"></textarea>
        </div>
        <div class="md:col-span-5 flex justify-end"><button class="${classes.button}" type="submit" aria-label="Create expense">Create Expense</button></div>
      </form>

      <div class="${classes.card} border-l-2 border-l-violet-500 dark:border-l-violet-400">
        <div class="${classes.tableWrap}">
          <table class="w-full">
            <thead><tr class="text-left"><th class="${classes.tableHead}">Title</th><th class="${classes.tableHead}">Category</th><th class="${classes.tableHead}">Amount</th><th class="${classes.tableHead}">Date</th><th class="${classes.tableHead} text-right">Actions</th></tr></thead>
            <tbody>${rows || `<tr><td class="${classes.tableCell}" colspan="5">No records</td></tr>`}</tbody>
          </table>
        </div>
      </div>
      <p id="financeMessage" class="${classes.message}"></p>
    </div>
  `;
}

async function renderReports(api) {
  const [statusData, performanceData] = await Promise.all([
    api('/reports/appointments/status'),
    api('/reports/therapists/performance')
  ]);

  const statusItems = (statusData || [])
    .map(
      (s) => `
      <div class="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-800 py-2">
        <span class="capitalize text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100">${escapeHtml(s._id || 'Unknown')}</span>
        <span class="text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100">${s.count}</span>
      </div>`
    )
    .join('');

  const performanceRows = (performanceData || [])
    .map(
      (p) => `
      <tr>
        <td class="${classes.tableCell}">${escapeHtml(p.name || 'Staff')}</td>
        <td class="${classes.tableCell}">${p.appointmentCount || 0}</td>
        <td class="${classes.tableCell}">${p.totalRevenue || 0}</td>
      </tr>`
    )
    .join('');

  return `
    <div class="space-y-4">
      <div class="grid md:grid-cols-2 gap-4">
        <div class="${classes.card} border-l-2 border-l-fuchsia-500 dark:border-l-fuchsia-400">
          <h3 class="${classes.heading} mb-4">Appointment Distribution</h3>
          <div class="space-y-1">
            ${statusItems || '<p class="text-xs font-mono font-normal text-zinc-500">No data available</p>'}
          </div>
        </div>

        <div class="${classes.card} border-l-2 border-l-violet-500 dark:border-l-violet-400">
          <h3 class="${classes.heading} mb-4">Therapist Performance</h3>
          <div class="${classes.tableWrap}">
            <table class="w-full">
              <thead>
                <tr class="text-left">
                  <th class="${classes.tableHead}">Therapist</th>
                  <th class="${classes.tableHead}">Appts</th>
                  <th class="${classes.tableHead}">Revenue</th>
                </tr>
              </thead>
              <tbody>${performanceRows || `<tr><td colspan="3" class="${classes.tableCell} text-center">No data available</td></tr>`}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function renderStaff(api) {
  const [staff, users] = await Promise.all([api('/staff'), api('/users')]);
  const staffByUserId = new Map((staff || []).map((s) => [s.user?._id, s]));
  const rows = (staff || [])
    .map(
      (s) => `
      <tr>
        <td class="${classes.tableCell}">${escapeHtml(s.user?.name || 'Unknown')}</td>
        <td class="${classes.tableCell}">${escapeHtml((s.user?.roles || []).join(', '))}</td>
        <td class="${classes.tableCell}">${escapeHtml(s.baseSalary)}</td>
        <td class="${classes.tableCell}">${escapeHtml(s.commissionPerSession)}</td>
        <td class="${classes.tableCell} text-right"><button data-action="archive-staff" data-id="${s._id}" class="${classes.actionButton}" aria-label="Archive staff">Archive</button></td>
      </tr>`
    )
    .join('');

  const userOptions = (users || [])
    .map((u) => {
      const linked = staffByUserId.get(u._id);
      const modeLabel = linked ? 'Update existing staff record' : 'Assign new staff record';
      return `<option value="${u._id}" data-staff-id="${linked?._id || ''}" data-base-salary="${linked?.baseSalary ?? 0}" data-commission="${linked?.commissionPerSession ?? 0}">${escapeHtml(u.name)} (${escapeHtml((u.roles || []).join(', '))}) • ${modeLabel}</option>`;
    })
    .join('');

  return `
    <div class="space-y-4">
      <form id="userManageForm" class="${classes.card} border-l-2 border-l-emerald-500 dark:border-l-emerald-400 grid md:grid-cols-3 gap-3">
        <div>
          <label class="${classes.label}" for="u_name">User name</label>
          <input id="u_name" class="${classes.field}" required aria-label="User name" />
        </div>
        <div>
          <label class="${classes.label}" for="u_email">Email</label>
          <input id="u_email" type="email" class="${classes.field}" required aria-label="User email" />
        </div>
        <div>
          <label class="${classes.label}" for="u_password">Password</label>
          <input id="u_password" type="password" class="${classes.field}" required aria-label="User password" />
        </div>
        <div>
          <label class="${classes.label}" for="u_role">Role</label>
          <select id="u_role" class="${classes.selectField}" aria-label="User role">
            <option value="receptionist">Receptionist</option>
            <option value="therapist">Therapist</option>
            <option value="admin">Admin</option>
          </select>
        </div>
        <div class="md:col-span-2">
          <label class="${classes.label}" for="u_contact">Contact info</label>
          <input id="u_contact" class="${classes.field}" aria-label="User contact info" />
        </div>
        <div class="md:col-span-3 flex justify-end">
          <button class="${classes.button}" type="submit" aria-label="Create user account">Create User Account</button>
        </div>
      </form>

      <form id="staffForm" class="${classes.card} border-l-2 border-l-blue-500 dark:border-l-blue-400 grid md:grid-cols-3 gap-3">
        <div>
          <label class="${classes.label}" for="st_user">User</label>
          <select id="st_user" class="${classes.selectField}" required aria-label="Select user">
            <option value="">Select User</option>
            ${userOptions}
          </select>
          <p id="st_user_mode" class="mt-1 text-[11px] uppercase tracking-widest font-mono font-normal text-zinc-400 dark:text-zinc-500">Select a user to assign or update staff values.</p>
        </div>
        <div>
          <label class="${classes.label}" for="st_baseSalary">Base Salary</label>
          <input id="st_baseSalary" type="number" min="0" step="0.01" class="${classes.field}" required aria-label="Base salary" />
        </div>
        <div>
          <label class="${classes.label}" for="st_commission">Commission per Session</label>
          <input id="st_commission" type="number" min="0" step="0.01" class="${classes.field}" required aria-label="Commission per session" />
        </div>
        <div class="md:col-span-3 flex justify-end">
          <button class="${classes.button}" type="submit" aria-label="Create staff record">Create Staff Record</button>
        </div>
      </form>

      <div class="${classes.card} border-l-2 border-l-violet-500 dark:border-l-violet-400">
        <div class="${classes.tableWrap}">
          <table class="w-full">
            <thead>
              <tr class="text-left">
                <th class="${classes.tableHead}">Name</th>
                <th class="${classes.tableHead}">Roles</th>
                <th class="${classes.tableHead}">Base Salary</th>
                <th class="${classes.tableHead}">Commission/Session</th>
                <th class="${classes.tableHead} text-right">Actions</th>
              </tr>
            </thead>
            <tbody>${rows || `<tr><td class="${classes.tableCell}" colspan="5">No records</td></tr>`}</tbody>
          </table>
        </div>
      </div>
      <p id="staffMessage" class="${classes.message}"></p>
    </div>
  `;
}
export function createTemplates(api, getCurrentUser) {
  return {
    dashboard: () => renderDashboard(api, getCurrentUser),
    patients: () => renderPatients(api),
    appointments: () => renderAppointments(api),
    services: () => renderServices(api),
    staff: () => renderStaff(api),
    finance: () => renderFinance(api),
    reports: () => renderReports(api)
  };
}
