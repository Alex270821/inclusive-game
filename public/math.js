const stock = document.getElementById('stockBriques');
const mur = document.getElementById('mur');
const barModel = document.getElementById('barModel');
const totalIn = document.getElementById('total');
const valider = document.getElementById('valider');
const dragon = document.getElementById('dragon');
const feedback = document.getElementById('feedback');
const modeBtn = document.getElementById('modeDys');
const audioToggle = document.getElementById('audioToggle');
const reset = document.getElementById('reset');
const teacherMode = document.getElementById('teacherPanel');
const progress = document.getElementById('progress');
const sonPoser = document.getElementById('sonPoser');
const sonWin = document.getElementById('sonWin');
const sonError = document.getElementById('sonError');
const narration = document.getElementById('narration');

let a = 6, b = 4, score = 0, audioOn = true;

// Génère briques
function creerBriques(n, couleur, parent) {
  for (let i = 0; i < n; i++) {
    const b = document.createElement('div');
    b.className = `brique ${couleur}`;
    b.draggable = true;
    b.setAttribute('aria-label', `Brique ${couleur}`);
    b.tabIndex = 0; // Accessible via keyboard
    parent.appendChild(b);
  }
}

// Génère modèle en barres (Singapore method)
function creerBarModel() {
  barModel.innerHTML = '';
  for (let i = 0; i < a; i++) {
    const b = document.createElement('div');
    b.className = 'brique bleu';
    barModel.appendChild(b);
  }
  for (let i = 0; i < b; i++) {
    const b = document.createElement('div');
    b.className = 'brique rouge';
    barModel.appendChild(b);
  }
}

// Lit la consigne à voix haute
function narrateConsigne() {
  if (audioOn) {
    const consigne = `Le dragon demande ${a} briques bleues et ${b} briques rouges. Combien de briques au total ?`;
    narration.src = `https://ttsmp3.com/created_files/${encodeURIComponent(consigne)}.mp3`; // Placeholder for TTS
    narration.play();
  }
}

// Initialisation
function init() {
  stock.innerHTML = '';
  mur.innerHTML = '';
  creerBriques(a, 'bleu', stock);
  creerBriques(b, 'rouge', stock);
  creerBarModel();
  narrateConsigne();
  feedback.textContent = '';
  totalIn.value = '';
}
init();

// Drag & drop
document.addEventListener('dragstart', (e) => {
  if (e.target.classList.contains('brique')) {
    e.dataTransfer.setData('text', e.target.className);
    if (audioOn) sonPoser.play();
  }
});

mur.addEventListener('dragover', (e) => e.preventDefault());

mur.addEventListener('drop', (e) => {
  e.preventDefault();
  const className = e.dataTransfer.getData('text');
  const b = document.createElement('div');
  b.className = className;
  b.setAttribute('aria-label', `Brique ${className.includes('bleu') ? 'bleue' : 'rouge'}`);
  b.tabIndex = 0;
  mur.appendChild(b);
  if (audioOn) sonPoser.play();
});

// Keyboard accessibility
document.addEventListener('keydown', (e) => {
  if (e.target.classList.contains('brique') && e.key === 'Enter') {
    const b = document.createElement('div');
    b.className = e.target.className;
    b.setAttribute('aria-label', `Brique ${e.target.className.includes('bleu') ? 'bleue' : 'rouge'}`);
    b.tabIndex = 0;
    mur.appendChild(b);
    e.target.remove();
    if (audioOn) sonPoser.play();
  }
});

// Validation
valider.addEventListener('click', () => {
  const total = parseInt(totalIn.value);
  if (total === a + b && mur.children.length === a + b) {
    score++;
    progress.textContent = `${score}/10`;
    if (audioOn) sonWin.play();
    dragon.classList.add('dragon-win');
    feedback.textContent = '🎉 Bravo ! Le mur est parfait !';
    // Feux d'artifice
    for (let i = 0; i < 60; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * window.innerWidth + 'px';
      star.style.top = Math.random() * window.innerHeight + 'px';
      document.body.appendChild(star);
      setTimeout(() => star.remove(), 1500);
    }
    // Nouvelle question
    a = Math.floor(Math.random() * 9) + 1;
    b = Math.floor(Math.random() * 9) + 1;
    document.getElementById('a').textContent = a;
    document.getElementById('b').textContent = b;
    init();
    setTimeout(() => dragon.classList.remove('dragon-win'), 2000);
  } else {
    if (audioOn) sonError.play();
    feedback.textContent = '🐉 Oups, vérifie le nombre de briques ou le total !';
    dragon.style.transform = 'translate(480px, 180px) scale(2) rotate(-10deg)';
    setTimeout(() => dragon.style.transform = 'translate(480px, 180px) scale(2)', 500);
  }
});

// Mode DYS
modeBtn.addEventListener('click', () => {
  document.body.classList.toggle('dys');
  narrateConsigne();
});

// Audio toggle
audioToggle.addEventListener('click', () => {
  audioOn = !audioOn;
  audioToggle.textContent = audioOn ? '🔊 Audio' : '🔇 Audio';
  if (audioOn) narrateConsigne();
});

// Reset
reset.addEventListener('click', () => {
  a = 6;
  b = 4;
  score = 0;
  progress.textContent = '0/10';
  init();
});

// Teacher mode
teacherMode.addEventListener('click', () => {
  teacherPanel.classList.toggle('hidden');
});
