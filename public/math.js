// Château + dragon + cubes magiques
const canvas = document.getElementById('chateau');
const ctx     = canvas.getContext('2d');
const input   = document.getElementById('inputRep');
const valider = document.getElementById('valider');
const son     = document.getElementById('sonReussite');
const modeBtn = document.getElementById('modeDys');

let a = 6, b = 4;

// Dessin du château
function drawChateau(){
  ctx.clearRect(0,0,900,550);
  ctx.fillStyle='#2f1b69';
  ctx.fillRect(0,350,900,200);
  ctx.fillStyle='#8b5e3c';
  for(let i=0;i<5;i++){
    ctx.fillRect(100+i*150,250,100,100);
    ctx.fillRect(120+i*150,200,60,50);
  }
  // dragon
  ctx.fillStyle='#ffd700';
  ctx.beginPath();
  ctx.arc(450,200,30,0,Math.PI*2);
  ctx.fill();
  ctx.fillStyle='#000';
  ctx.fillText('🐉',437,207);
}
drawChateau();

// Génération des cubes
function genererCubes(n, conteneur){
  conteneur.innerHTML='';
  for(let i=0;i<n;i++){
    const cube=document.createElement('div');
    cube.className='cube';
    conteneur.appendChild(cube);
  }
}
genererCubes(a, document.getElementById('zoneCubes'));
genererCubes(b, document.getElementById('zoneCubes'));

// Validation
valider.addEventListener('click',()=>{
  const rep = +input.value;
  if(rep === a + b){
    son.play();
    // Effet étoiles
    for(let i=0;i<50;i++){
      const etoile=document.createElement('div');
      etoile.style.position='absolute';
      etoile.style.left=Math.random()*900+'px';
      etoile.style.top=Math.random()*550+'px';
      etoile.style.width='8px';
      etoile.style.height='8px';
      etoile.style.background='#fff700';
      etoile.style.borderRadius='50%';
      etoile.style.animation='explose 1s forwards';
      document.body.appendChild(etoile);
      setTimeout(()=>etoile.remove(),1000);
    }
    setTimeout(()=>alert('Explosion magique ! +10 joyaux 🌟'),100);
    // Nouvelle question
    a = Math.floor(Math.random()*9)+1;
    b = Math.floor(Math.random()*9)+1;
    document.getElementById('a').textContent = a;
    document.getElementById('b').textContent = b;
    genererCubes(a+b, document.getElementById('zoneCubes'));
    input.value='';
  }else{
    alert('Essaye encore !');
  }
});

// Mode DYS
modeBtn.addEventListener('click',()=>document.body.classList.toggle('dys'));

// Animation CSS
const style=document.createElement('style');
style.textContent=`
@keyframes explose{
  0%{transform:scale(0);opacity:1}
  100%{transform:scale(3);opacity:0}
}`;
document.head.appendChild(style);
