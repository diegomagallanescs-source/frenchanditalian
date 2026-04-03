// quiz.js — Matching game logic

let matchPool = [];
let currentRound = [];
let selectedForeign = null;
let selectedEnglish = null;
let matchedCount = 0;
let totalRounds = 0;
let score = 0;
let currentCategory = 'All';
let currentTab = 'phrases';
const ROUND_SIZE = 8;

function buildPool() {
  const data = App.getCurrentData();
  const source = currentTab === 'words' ? data.words : data.phrases;
  if (currentCategory === 'All') {
    matchPool = [...source];
  } else {
    matchPool = source.filter(item => item.category === currentCategory);
  }
}

function startRound() {
  matchedCount = 0;
  selectedForeign = null;
  selectedEnglish = null;

  const shuffled = App.shuffle(matchPool);
  currentRound = shuffled.slice(0, Math.min(ROUND_SIZE, matchPool.length));
  totalRounds++;

  renderRound();
}

function renderRound() {
  const langCode = App.getLangCode();
  const foreignList = document.getElementById('foreign-list');
  const englishList = document.getElementById('english-list');
  const status = document.getElementById('match-status');

  status.textContent = `Match ${currentRound.length} pairs — click one from each column`;
  status.className = 'match-status';

  const shuffledEnglish = App.shuffle([...currentRound]);

  foreignList.innerHTML = '';
  englishList.innerHTML = '';

  currentRound.forEach(item => {
    const card = document.createElement('div');
    card.className = 'match-card match-card--foreign';
    card.dataset.id = item.id;

    const textEl = document.createElement('span');
    textEl.textContent = item.foreign;
    card.appendChild(textEl);

    const speakBtn = App.makeSpeakBtn(item.foreign, langCode, true);
    card.appendChild(speakBtn);

    card.addEventListener('click', (e) => {
      if (e.target.closest('.speak-btn')) return;
      handleForeignClick(card, item);
    });
    foreignList.appendChild(card);
  });

  shuffledEnglish.forEach(item => {
    const card = document.createElement('div');
    card.className = 'match-card match-card--english';
    card.dataset.id = item.id;
    card.textContent = item.english;
    card.addEventListener('click', () => handleEnglishClick(card, item));
    englishList.appendChild(card);
  });
}

function handleForeignClick(card, item) {
  if (card.classList.contains('matched')) return;

  document.querySelectorAll('.match-card--foreign.selected').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedForeign = { card, item };

  if (selectedEnglish) checkMatch();
}

function handleEnglishClick(card, item) {
  if (card.classList.contains('matched')) return;

  document.querySelectorAll('.match-card--english.selected').forEach(c => c.classList.remove('selected'));
  card.classList.add('selected');
  selectedEnglish = { card, item };

  if (selectedForeign) checkMatch();
}

function checkMatch() {
  const { card: fCard, item: fItem } = selectedForeign;
  const { card: eCard, item: eItem } = selectedEnglish;

  if (fItem.id === eItem.id) {
    // Correct!
    fCard.classList.remove('selected');
    eCard.classList.remove('selected');
    fCard.classList.add('matched');
    eCard.classList.add('matched');
    score++;
    matchedCount++;

    updateScore();

    document.getElementById('match-status').textContent = '✓ Correct!';
    document.getElementById('match-status').className = 'match-status match-status--correct';

    if (matchedCount === currentRound.length) {
      setTimeout(() => {
        document.getElementById('match-status').textContent = `🎉 Round complete! All ${currentRound.length} matched!`;
        document.getElementById('match-status').className = 'match-status match-status--complete';
        document.getElementById('btn-next-round').style.display = 'inline-flex';
      }, 500);
    }
  } else {
    // Wrong
    fCard.classList.add('wrong');
    eCard.classList.add('wrong');
    document.getElementById('match-status').textContent = '✗ Not a match — try again';
    document.getElementById('match-status').className = 'match-status match-status--wrong';

    setTimeout(() => {
      fCard.classList.remove('wrong', 'selected');
      eCard.classList.remove('wrong', 'selected');
    }, 900);
  }

  selectedForeign = null;
  selectedEnglish = null;
}

function updateScore() {
  document.getElementById('score-display').textContent = `Score: ${score}`;
}

function renderCategoryButtons() {
  const data = App.getCurrentData();
  const source = currentTab === 'words' ? data.words : data.phrases;
  const categories = ['All', ...new Set(source.map(item => item.category))];
  const container = document.getElementById('quiz-category-tabs');
  container.innerHTML = '';

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className = 'cat-btn' + (cat === currentCategory ? ' active' : '');
    btn.textContent = cat;
    btn.addEventListener('click', () => {
      currentCategory = cat;
      buildPool();
      score = 0;
      updateScore();
      renderCategoryButtons();
      startRound();
    });
    container.appendChild(btn);
  });
}

function initQuiz() {
  App.initNav();

  const data = App.getCurrentData();
  document.getElementById('lang-title').textContent = `${data.flag} ${data.language} Matching Game`;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTab = btn.dataset.tab;
      currentCategory = 'All';
      score = 0;
      updateScore();
      buildPool();
      renderCategoryButtons();
      startRound();
    });
  });

  document.getElementById('btn-next-round').addEventListener('click', () => {
    document.getElementById('btn-next-round').style.display = 'none';
    startRound();
  });

  buildPool();
  renderCategoryButtons();
  updateScore();
  startRound();
}

document.addEventListener('DOMContentLoaded', initQuiz);
