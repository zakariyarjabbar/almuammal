const shared = `fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"`;

const paths = {
  arrow: `<path ${shared} d="M5 12h14"/><path ${shared} d="m13 6 6 6-6 6"/>`,
  menu: `<path ${shared} d="M4 7h16M4 12h16M4 17h16"/>`,
  close: `<path ${shared} d="M6 6l12 12M18 6 6 18"/>`,
  sign: `<path ${shared} d="M4 7h16v8H4z"/><path ${shared} d="M8 15v5M16 15v5"/><path ${shared} d="M7 10h10"/>`,
  led: `<rect ${shared} x="4" y="5" width="16" height="12" rx="1.5"/><path ${shared} d="M8 20h8M8 9h.01M12 9h.01M16 9h.01M8 13h.01M12 13h.01M16 13h.01"/>`,
  vehicle: `<path ${shared} d="M4 15h16l-2-5H7l-3 5Z"/><path ${shared} d="M6 15v3M18 15v3"/><circle ${shared} cx="8" cy="18" r="1.5"/><circle ${shared} cx="16" cy="18" r="1.5"/>`,
  neon: `<path ${shared} d="M7 18c-2.5-2-3-5.3-.8-7.7C8.7 7.5 13 9 13 12c0 2.8-4 2.3-4 .1 0-3.4 6.7-6.5 10-2.5 2.1 2.6 1.2 6.2-1.6 8.4"/><path ${shared} d="M6 21h12"/>`,
  glass: `<path ${shared} d="M6 3h12v18H6z"/><path ${shared} d="M10 3 6 21M18 8 14 21"/>`,
  poster: `<path ${shared} d="M7 3h10v18H7z"/><path ${shared} d="M10 8h4M10 12h4M10 16h2"/>`,
  board: `<path ${shared} d="M5 5h14v11H5z"/><path ${shared} d="M8 21h8M12 16v5"/><path ${shared} d="m8 13 3-3 2 2 3-4"/>`,
  quality: `<path ${shared} d="m12 3 2.4 4.9 5.4.8-3.9 3.8.9 5.4L12 15.4 7.2 18l.9-5.4-3.9-3.8 5.4-.8L12 3Z"/>`,
  design: `<path ${shared} d="m4 20 4.5-1L19 8.5 15.5 5 5 15.5 4 20Z"/><path ${shared} d="m13.5 7 3.5 3.5"/>`,
  install: `<path ${shared} d="M4 7h16M8 7v10a4 4 0 0 0 8 0V7"/><path ${shared} d="M10 17h4"/>`,
  complete: `<path ${shared} d="M4 12h6V6H4v6Zm10 6h6v-6h-6v6ZM4 22h6v-6H4v6Zm10-10h6V6h-6v6Z"/>`,
  phone: `<path ${shared} d="M7 4h3l1.5 4-2 1.3a12 12 0 0 0 5.2 5.2l1.3-2 4 1.5v3a2 2 0 0 1-2.2 2A15 15 0 0 1 5 6.2 2 2 0 0 1 7 4Z"/>`,
  whatsapp: `<path ${shared} d="M5 20.5 6.2 17A8 8 0 1 1 9 19.2L5 20.5Z"/><path ${shared} d="M9.5 8.7c.2 3.3 2.4 5.6 5.8 5.9"/>`,
  email: `<path ${shared} d="M4 6h16v12H4z"/><path ${shared} d="m4 8 8 6 8-6"/>`,
  map: `<path ${shared} d="M12 21s6-5.1 6-11a6 6 0 1 0-12 0c0 5.9 6 11 6 11Z"/><circle ${shared} cx="12" cy="10" r="2"/>`,
  clock: `<circle ${shared} cx="12" cy="12" r="8"/><path ${shared} d="M12 8v4l3 2"/>`,
  instagram: `<rect ${shared} x="5" y="5" width="14" height="14" rx="4"/><circle ${shared} cx="12" cy="12" r="3"/><path ${shared} d="M16.5 7.5h.01"/>`,
  facebook: `<path ${shared} d="M14 8h2V4h-3a5 5 0 0 0-5 5v3H5v4h3v5h4v-5h3l1-4h-4V9a1 1 0 0 1 1-1Z"/>`,
  tiktok: `<path ${shared} d="M14 4v10a4 4 0 1 1-4-4"/><path ${shared} d="M14 4c1 3 3 4.5 6 4.8"/>`,
  youtube: `<path ${shared} d="M4 9.5c.2-1.8.7-2.8 2.6-3C8 6.2 10 6 12 6s4 .2 5.4.5c1.9.2 2.4 1.2 2.6 3 .2 1.4.2 3.6 0 5-.2 1.8-.7 2.8-2.6 3C16 17.8 14 18 12 18s-4-.2-5.4-.5c-1.9-.2-2.4-1.2-2.6-3-.2-1.4-.2-3.6 0-5Z"/><path ${shared} d="m10 9 5 3-5 3V9Z"/>`,
  linkedin: `<path ${shared} d="M6 10v9M6 6.2v.1M10 19v-9h4.2c2.4 0 3.8 1.5 3.8 4.3V19M14 19v-4.8"/>`
};

export function icon(name, className = "") {
  const markup = paths[name] || paths.complete;
  return `<svg class="icon ${className}" aria-hidden="true" viewBox="0 0 24 24">${markup}</svg>`;
}
