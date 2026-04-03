// culture.js — culture page logic

function initCulture() {
  App.initNav();
  const data = App.getCurrentData();

  document.getElementById('lang-title').textContent = `${data.flag} ${data.language} Culture`;

  // Overview
  document.getElementById('culture-overview').textContent = data.culture.overview;
  document.getElementById('culture-people').textContent = data.culture.people;
  document.getElementById('culture-dining').textContent = data.culture.dining;

  // Social norms
  const normsList = document.getElementById('social-norms-list');
  normsList.innerHTML = '';
  data.culture.socialNorms.forEach(norm => {
    const li = document.createElement('div');
    li.className = 'norm-item';
    li.innerHTML = `<span class="norm-bullet">→</span><span>${norm}</span>`;
    normsList.appendChild(li);
  });

  // Gestures
  const gesturesGrid = document.getElementById('gestures-grid');
  gesturesGrid.innerHTML = '';
  data.gestures.forEach(g => {
    const card = document.createElement('div');
    card.className = 'gesture-card';
    card.innerHTML = `
      <div class="gesture-emoji">${g.emoji}</div>
      <div class="gesture-name">${g.name}</div>
      <div class="gesture-desc">${g.description}</div>
    `;
    gesturesGrid.appendChild(card);
  });

  // Fun facts
  const factsGrid = document.getElementById('facts-grid');
  factsGrid.innerHTML = '';
  data.facts.forEach(fact => {
    const card = document.createElement('div');
    card.className = 'fact-card';
    card.innerHTML = `
      <div class="fact-emoji">${fact.emoji}</div>
      <div class="fact-title">${fact.title}</div>
      <div class="fact-text">${fact.text}</div>
    `;
    factsGrid.appendChild(card);
  });
}

document.addEventListener('DOMContentLoaded', initCulture);
