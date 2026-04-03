// learn.js — words and phrases page logic

let currentTab = 'phrases';
let activeCategory = 'All';

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
      const speakBtn = App.makeSpeakBtn(item.foreign, langCode);
      card.appendChild(speakBtn);
      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}

function initLearn() {
  App.initNav();

  const data = App.getCurrentData();
  document.getElementById('lang-title').textContent = `${data.flag} Learn ${data.language}`;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      activeCategory = 'All';
      const source = currentTab === 'words' ? data.words : data.phrases;
      renderCategoryFilter(source);
      renderList();
    });
  });

  const initialSource = data.phrases;
  renderCategoryFilter(initialSource);
  renderList();
}

document.addEventListener('DOMContentLoaded', initLearn);
