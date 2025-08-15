const canvas = document.getElementById('chateau');
const ctx = canvas.getContext('2d');
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const verifierBtn = document.getElementById('verifier');

let score = 0;

function drawStars(n) {
  ctx.clearRect(0,0,800,500);
  for(let i=0;i<n;i++){
    ctx.fillStyle='#fff700';
    ctx.beginPath();
    ctx.arc(Math.random()*800,Math.random()*500,2+Math.random()*3,0,Math.PI*2);
    ctx.fill();
  }
}

const questions = [
  {q:'6 + 4 = ?', r:10},
  {q:'7 + 9 = ?', r:16},
  {q:'12 + 3 = ?', r:15}
];
let current = 0;

questionEl.textContent = questions[current].q;

verifierBtn.addEventListener('click',()=>{
  const rep = +answerEl.value;
  if(rep === questions[current].r){
    score += 10;
    drawStars(score);
    alert('Explosion d’étoiles ! +10 🌟');
    current = (current+1)%questions.length;
    questionEl.textContent = questions[current].q;
    answerEl.value='';
  }else{
    alert('Essaye encore !');
  }
});
