// learn.js — words and phrases page logic

let currentTab = 'phrases';
let activeCategory = 'All';
let selectionMode = false;
let selectedItems = new Map(); // id -> item

function renderCategoryFilter(source) {
  const categories = ['All', ...new Set(source.map(item => item.category))];
  const container = document.getElementById('learn-categories');
  container.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat === activeCategory ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      activeCategory = cat;
      renderList();
      renderCategoryFilter(source);
    });
    container.appendChild(btn);
  });
}

function renderList() {
  const data = App.getCurrentData();
  const source = currentTab === 'words' ? data.words : data.phrases;
  const langCode = App.getLangCode();

  const filtered = activeCategory === 'All'
    ? source
    : source.filter(item => item.category === activeCategory);

  const grouped = App.groupBy(filtered, 'category');
  const container = document.getElementById('learn-list');
  container.innerHTML = '';

  const countEl = document.getElementById('item-count');
  countEl.textContent = `${filtered.length} ${currentTab === 'words' ? 'words' : 'phrases'}`;

  Object.entries(grouped).forEach(([category, items]) => {
    const section = document.createElement('div');
    section.className = 'learn-section';

    const heading = document.createElement('h2');
    heading.className = 'section-heading';
    heading.textContent = category;
    section.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'learn-grid';

    items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'learn-card';

      card.innerHTML = `
        <div class="learn-card__foreign">${item.foreign}</div>
        <div class="learn-card__pronunciation">${item.pronunciation || ''}</div>
        <div class="learn-card__english">${item.english}</div>
      `;

      if (selectionMode) {
        card.classList.add('selectable');
        if (selectedItems.has(item.id)) card.classList.add('card-selected');

        const checkmark = document.createElement('div');
        checkmark.className = 'card-checkmark';
        checkmark.textContent = '✓';
        card.appendChild(checkmark);

        card.addEventListener('click', () => {
          if (selectedItems.has(item.id)) {
            selectedItems.delete(item.id);
            card.classList.remove('card-selected');
          } else {
            if (selectedItems.size >= 15) {
              const tray = document.getElementById('selection-tray');
              tray.classList.add('tray-shake');
              setTimeout(() => tray.classList.remove('tray-shake'), 500);
              return;
            }
            selectedItems.set(item.id, item);
            card.classList.add('card-selected');
          }
          updateTray();
        });
      } else {
        const speakBtn = App.makeSpeakBtn(item.foreign, langCode);
        card.appendChild(speakBtn);
      }

      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

function updateTray() {
  const count = selectedItems.size;
  document.getElementById('tray-count').textContent = `${count} / 15 selected`;
  document.getElementById('btn-ready').disabled = count < 2;
  document.getElementById('selection-tray').classList.toggle('tray-visible', count > 0);
  // reset choices panel
  document.getElementById('tray-choices').style.display = 'none';
  document.getElementById('tray-actions').style.display = 'flex';
}

function exitSelectionMode() {
  selectionMode = false;
  selectedItems.clear();
  const btn = document.getElementById('btn-select-mode');
  btn.classList.remove('active');
  btn.textContent = '✓ Select to Study';
  document.getElementById('selection-tray').classList.remove('tray-visible');
}

function initLearn() {
  App.initNav();

  const data = App.getCurrentData();
  document.getElementById('lang-title').textContent = `${data.flag} Learn ${data.language}`;

  // Tab switching
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      activeCategory = 'All';
      exitSelectionMode();
      const source = currentTab === 'words' ? data.words : data.phrases;
      renderCategoryFilter(source);
      renderList();
    });
  });

  // Select mode toggle
  document.getElementById('btn-select-mode').addEventListener('click', () => {
    selectionMode = !selectionMode;
    const btn = document.getElementById('btn-select-mode');
    btn.classList.toggle('active', selectionMode);
    btn.textContent = selectionMode ? '✕ Cancel Selection' : '✓ Select to Study';
    if (!selectionMode) {
      selectedItems.clear();
      document.getElementById('selection-tray').classList.remove('tray-visible');
    }
    renderList();
  });

  // Ready button → show choices
  document.getElementById('btn-ready').addEventListener('click', () => {
    document.getElementById('tray-actions').style.display = 'none';
    document.getElementById('tray-choices').style.display = 'flex';
  });

  // Cancel choices
  document.getElementById('btn-cancel-choices').addEventListener('click', () => {
    document.getElementById('tray-choices').style.display = 'none';
    document.getElementById('tray-actions').style.display = 'flex';
  });

  // Launch flashcards
  document.getElementById('btn-launch-flash').addEventListener('click', () => {
    localStorage.setItem('eurolingo_custom_set', JSON.stringify(Array.from(selectedItems.values())));
    window.location.href = 'flashcards.html';
  });

  // Launch match game
  document.getElementById('btn-launch-match').addEventListener('click', () => {
    localStorage.setItem('eurolingo_custom_set', JSON.stringify(Array.from(selectedItems.values())));
    window.location.href = 'match.html';
  });

  renderCategoryFilter(data.phrases);
  renderList();
}

document.addEventListener('DOMContentLoaded', initLearn);