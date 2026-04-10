export const classes = {
  heading: 'text-sm font-medium text-zinc-800 dark:text-zinc-200',
  label:
    'block text-[11px] uppercase tracking-widest font-mono font-normal text-zinc-400 dark:text-zinc-500 mb-1',
  field:
    'w-full bg-white dark:bg-zinc-900 border border-black dark:border-zinc-700 rounded-sm px-3 py-2 text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors duration-100',
  selectField:
    'w-full bg-white dark:bg-zinc-900 border border-black dark:border-zinc-700 rounded-sm px-3 py-2 text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-900 dark:focus:ring-zinc-100 transition-colors duration-100 [&>option]:bg-white dark:[&>option]:bg-zinc-900 [&>option]:text-zinc-900 dark:[&>option]:text-zinc-100',
  button:
    'bg-transparent border border-black dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono font-normal text-sm rounded-sm px-4 py-2 hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 dark:hover:border-zinc-100 active:scale-[0.97] transition-all duration-100',
  actionButton:
    'bg-transparent border border-black dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 font-mono font-normal text-sm rounded-sm px-3 py-1.5 hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 dark:hover:border-zinc-100 active:scale-[0.97] transition-all duration-100',
  card: 'bg-white dark:bg-zinc-950 border border-black dark:border-zinc-800 rounded-sm p-4',
  tableWrap: 'overflow-auto bg-white dark:bg-zinc-950 border border-black dark:border-zinc-800 rounded-sm',
  tableHead:
    'py-2 px-2 text-[11px] uppercase tracking-widest font-mono font-normal text-zinc-400 dark:text-zinc-500',
  tableCell:
    'py-2 px-2 text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100 border-t border-zinc-100 dark:border-zinc-800',
  message: 'text-sm font-mono font-normal'
};

export const routeRoles = {
  dashboard: ['admin', 'receptionist', 'therapist'],
  patients: ['admin', 'receptionist', 'therapist'],
  appointments: ['admin', 'receptionist', 'therapist'],
  services: ['admin', 'therapist'],
  staff: ['admin'],
  finance: ['admin'],
  reports: ['admin']
};

export const navClass = {
  base: 'block rounded-sm border border-black dark:border-zinc-700 px-3 py-2 text-sm font-mono font-normal text-zinc-900 dark:text-zinc-100 transition-colors duration-100',
  active: 'bg-zinc-200 text-zinc-900 border-black dark:bg-zinc-100 dark:text-zinc-900 dark:border-zinc-100',
  idle: 'hover:bg-zinc-900 hover:text-zinc-100 hover:border-zinc-900 dark:hover:bg-zinc-100 dark:hover:text-zinc-900 dark:hover:border-zinc-100'
};
