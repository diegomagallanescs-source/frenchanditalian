// app.js — shared utilities across all pages

const App = (() => {
  const STORAGE_KEY = 'eurolingo_lang';

  function getCurrentLang() {
    return localStorage.getItem(STORAGE_KEY) || 'french';
  }

  function setCurrentLang(lang) {
    localStorage.setItem(STORAGE_KEY, lang);
  }

  function getCurrentData() {
    return getCurrentLang() === 'italian' ? ITALIAN_DATA : FRENCH_DATA;
  }

  function getLangCode() {
    return getCurrentData().langCode;
  }

  // Initialize nav language buttons
  function initNav() {
    const lang = getCurrentLang();
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
      btn.addEventListener('click', () => {
        setCurrentLang(btn.dataset.lang);
        window.location.reload();
      });
    });

    // Highlight current page in nav
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href').split('/').pop();
      link.classList.toggle('active', href === currentPage);
    });

    // Update flag display
    const flagEl = document.getElementById('current-flag');
    if (flagEl) flagEl.textContent = getCurrentData().flag;

    // Speed slider
    const savedRate = parseFloat(localStorage.getItem('eurolingo_rate') || '0.82');
    const navEl = document.querySelector('.navbar');
    if (navEl && !navEl.querySelector('.speed-control')) {
      const control = document.createElement('div');
      control.className = 'speed-control';
      control.innerHTML = `
        <label class="speed-label">
          🔊 Speed
          <input type="range" class="speed-slider" min="0.1" max="1.2" step="0.05" value="${savedRate}" />
          <span class="speed-value">${savedRate}x</span>
        </label>
      `;
      navEl.appendChild(control);

      const slider = control.querySelector('.speed-slider');
      const display = control.querySelector('.speed-value');
      slider.addEventListener('input', () => {
        const val = parseFloat(slider.value).toFixed(2);
        display.textContent = `${val}x`;
        localStorage.setItem('eurolingo_rate', val);
      });
    }
  }

  // Build a speak button
  function makeSpeakBtn(text, langCode, small = false) {
    const btn = document.createElement('button');
    btn.className = small ? 'speak-btn speak-btn--sm' : 'speak-btn';
    btn.title = 'Listen to pronunciation';
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path><path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>`;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      Speech.speak(text, langCode);
      btn.classList.add('speaking');
      setTimeout(() => btn.classList.remove('speaking'), 2000);
    });
    return btn;
  }

  // Group array by a key
  function groupBy(arr, key) {
    return arr.reduce((acc, item) => {
      const group = item[key];
      if (!acc[group]) acc[group] = [];
      acc[group].push(item);
      return acc;
    }, {});
  }

  // Shuffle array
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  return { getCurrentLang, setCurrentLang, getCurrentData, getLangCode, initNav, makeSpeakBtn, groupBy, shuffle };
})();
