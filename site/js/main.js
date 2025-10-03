import { initUI } from './ui/uiController.js';

document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('#app');
  initUI({ root });
});
