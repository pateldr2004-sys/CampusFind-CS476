const toggle = document.querySelector('[data-theme-toggle]');
const root = document.documentElement;
let theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
root.setAttribute('data-theme', theme);

const updateToggleLabel = () => {
  if (toggle) {
    toggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
  }
};

updateToggleLabel();

toggle?.addEventListener('click', () => {
  theme = theme === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-theme', theme);
  updateToggleLabel();
});

const submitLostReportBtn = document.querySelector('#submit-lost-report');
const reportArea = document.querySelector('#report-area');
const successSection = document.querySelector('#claim-success');

submitLostReportBtn?.addEventListener('click', () => {
  if (reportArea && successSection) {
    reportArea.setAttribute('hidden', '');
    successSection.removeAttribute('hidden');
    window.location.hash = 'claim-success';
  }
});