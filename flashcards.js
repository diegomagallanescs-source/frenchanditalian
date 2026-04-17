// flashcards.js — Flashcard deck logic

let currentDeck = [];
let currentIndex = 0;
let isFlipped = false;
let isShuffled = false;
let currentCategory = 'All';
let currentTab = 'phrases'; // 'phrases' or 'words'

function buildDeck() {
  const customRaw = localStorage.getItem('eurolingo_custom_set');
  if (customRaw) {
    try {
      const customItems = JSON.parse(customRaw);
      currentDeck = isShuffled ? App.shuffle(customItems) : [...customItems];
      currentIndex = 0;
      isFlipped = false;
      return;
    } catch(e) {}
  }

  const data = App.getCurrentData();
  const source = currentTab === 'words' ? data.words : data.phrases;
  if (currentCategory === 'All') {
    currentDeck = isShuffled ? App.shuffle(source) : [...source];
  } else {
    const filtered = source.filter(item => item.category === currentCategory);
    currentDeck = isShuffled ? App.shuffle(filtered) : [...filtered];
  }
  currentIndex = 0;
  isFlipped = false;
}

function renderCategoryButtons() {
  const data = App.getCurrentData();
  const source = currentTab === 'words' ? data.words : data.phrases;
  const categories = ['All', ...new Set(source.map(item => item.category))];

  const container = document.getElementById('category-tabs');
  container.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat === currentCategory ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      currentCategory = cat;
      buildDeck();
      renderCard();
      renderCategoryButtons();
    });
    container.appendChild(btn);
  });
}

function renderCard() {
  const card = document.getElementById('flashcard');
  const front = document.getElementById('card-front');
  const back = document.getElementById('card-back');
  const counter = document.getElementById('card-counter');
  const emptyState = document.getElementById('empty-state');

  if (currentDeck.length === 0) {
    card.style.display = 'none';
    emptyState.style.display = 'block';
    counter.textContent = '0 / 0';
    return;
  }

  card.style.display = 'block';
  emptyState.style.display = 'none';
  counter.textContent = `${currentIndex + 1} / ${currentDeck.length}`;

  const item = currentDeck[currentIndex];
  const langCode = App.getLangCode();

  // Build front (foreign language)
  front.innerHTML = '';
  const foreignText = document.createElement('div');
  foreignText.className = 'card-foreign';
  foreignText.textContent = item.foreign;
  front.appendChild(foreignText);

  const pronunciationEl = document.createElement('div');
  pronunciationEl.className = 'card-pronunciation';
  pronunciationEl.textContent = item.pronunciation || '';
  front.appendChild(pronunciationEl);

  const speakBtn = App.makeSpeakBtn(item.foreign, langCode);
  speakBtn.style.marginTop = '1.5rem';
  front.appendChild(speakBtn);

  const tapHint = document.createElement('div');
  tapHint.className = 'card-hint';
  tapHint.textContent = 'Tap card to reveal English';
  front.appendChild(tapHint);

  // Build back (English)
  back.innerHTML = '';
  const categoryTag = document.createElement('div');
  categoryTag.className = 'card-category-tag';
  categoryTag.textContent = item.category;
  back.appendChild(categoryTag);

  const englishText = document.createElement('div');
  englishText.className = 'card-english';
  englishText.textContent = item.english;
  back.appendChild(englishText);

  const foreignSmall = document.createElement('div');
  foreignSmall.className = 'card-foreign-small';
  foreignSmall.textContent = item.foreign;
  back.appendChild(foreignSmall);

  const speakBtn2 = App.makeSpeakBtn(item.foreign, langCode);
  speakBtn2.style.marginTop = '1rem';
  back.appendChild(speakBtn2);

  const tapHint2 = document.createElement('div');
  tapHint2.className = 'card-hint';
  tapHint2.textContent = 'Tap card to flip back';
  back.appendChild(tapHint2);

  // Reset flip
  isFlipped = false;
  card.classList.remove('flipped');

  updateNavButtons();
}

function flipCard() {
  const card = document.getElementById('flashcard');
  isFlipped = !isFlipped;
  card.classList.toggle('flipped', isFlipped);
}

function nextCard() {
  if (currentIndex < currentDeck.length - 1) {
    currentIndex++;
    renderCard();
  }
}

function prevCard() {
  if (currentIndex > 0) {
    currentIndex--;
    renderCard();
  }
}

function updateNavButtons() {
  document.getElementById('btn-prev').disabled = currentIndex === 0;
  document.getElementById('btn-next').disabled = currentIndex === currentDeck.length - 1;
}

function initFlashcards() {
  App.initNav();

  // Custom set banner
  const customRaw = localStorage.getItem('eurolingo_custom_set');
  if (customRaw) {
    try {
      const customItems = JSON.parse(customRaw);
      const banner = document.createElement('div');
      banner.className = 'custom-set-banner';
      banner.innerHTML = `📌 Custom set — ${customItems.length} items &nbsp;
        <button class="custom-clear-btn" id="btn-clear-custom">✕ Back to full deck</button>`;
      document.querySelector('.page-header').after(banner);
      document.getElementById('btn-clear-custom').addEventListener('click', () => {
        localStorage.removeItem('eurolingo_custom_set');
        window.location.reload();
      });
      // Hide category/tab UI when using custom set
      document.querySelector('.tab-switcher').style.display = 'none';
      document.getElementById('category-tabs').style.display = 'none';
    } catch(e) {}
  }

  const data = App.getCurrentData();
  document.getElementById('lang-title').textContent = `${data.flag} ${data.language} Flashcards`;

  // Tab switching (words vs phrases)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      currentCategory = 'All';
      buildDeck();
      renderCategoryButtons();
      renderCard();
    });
  });

  // Card click to flip
  document.getElementById('flashcard').addEventListener('click', flipCard);

  // Navigation
  document.getElementById('btn-prev').addEventListener('click', (e) => { e.stopPropagation(); prevCard(); });
  document.getElementById('btn-next').addEventListener('click', (e) => { e.stopPropagation(); nextCard(); });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextCard();
    if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prevCard();
    if (e.key === ' ') { e.preventDefault(); flipCard(); }
  });

  // Shuffle toggle
  document.getElementById('btn-shuffle').addEventListener('click', () => {
    isShuffled = !isShuffled;
    document.getElementById('btn-shuffle').classList.toggle('active', isShuffled);
    buildDeck();
    renderCard();
  });

  // Restart deck
  document.getElementById('btn-restart').addEventListener('click', () => {
    currentIndex = 0;
    buildDeck();
    renderCard();
  });

  buildDeck();
  renderCategoryButtons();
  renderCard();
}

document.addEventListener('DOMContentLoaded', initFlashcards);
