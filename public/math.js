const svg        = document.getElementById('chateau');
const dragon     = document.getElementById('dragon');
const zoneB      = document.getElementById('zoneBleue');
const zoneR      = document.getElementById('zoneRouge');
const plateau    = document.getElementById('plateauBarres');
const input      = document.getElementById('inputRep');
const valider    = document.getElementById('valider');
const son        = document.getElementById('sonReussite');
const sonDrag    = document.getElementById('sonDrag');
const modeBtn    = document.getElementById('modeDys');

let a = 6, b = 4;

// Génère cubes
function genererCubes(n, parent, color){
  for(let i=0;i<n;i++){
    const cube = document.createElement('div');
    cube.className = 'cube-3d cube-'+color;
    cube.draggable = true;
    parent.appendChild(cube);
  }
}
genererCubes(a, zoneB, 'bleu');
genererCubes(b, zoneR, 'rouge');

// Drag & drop
['dragstart','dragend'].forEach(evt=>{
  document.addEventListener(evt, e=>{
    if(e.target.classList.contains('cube-3d')){
      e.target.style.opacity = evt==='dragstart'?.5:1;
      if(evt==='dragstart') sonDrag.play();
    }
  });
});
plateau.addEventListener('dragover',e=>e.preventDefault());
plateau.addEventListener('drop',e=>{
  e.preventDefault();
  const cube = e.target.classList.contains('cube-3d')?e.target:null;
  if(cube){
    plateau.appendChild(cube);
    genererBarres();
  }
});

// Barres de 10
function genererBarres(){
  plateau.innerHTML='';
  const cubes = plateau.querySelectorAll('.cube-3d');
  const total = cubes.length;
  const dizaines = Math.floor(total/10);
  const reste   = total%10;
  for(let i=0;i<dizaines;i++){
    const bar=document.createElement('div');
    bar.className='barre-10';
    plateau.appendChild(bar);
  }
  for(let i=0;i<reste;i++){
    const cube=document.createElement('div');
    cube.className='cube-3d cube-bleu';
    plateau.appendChild(cube);
  }
}

// Validation
valider.addEventListener('click',()=>{
  const total = plateau.querySelectorAll('.cube-3d').length;
  if(total === a + b){
    son.play();
    // Feux d’artifice
    for(let i=0;i<60;i++){
      const feu=document.createElement('div');
      feu.style.position='absolute';
      feu.style.left=Math.random()*1000+'px';
      feu.style.top=Math.random()*600+'px';
      feu.style.width='8px';feu.style.height='8px';
      feu.style.background='#'+Math.floor(Math.random()*16777215).toString(16);
      feu.style.borderRadius='50%';
      feu.style.animation='explose 1.4s forwards';
      document.body.appendChild(feu);
      setTimeout(()=>feu.remove(),1400);
    }
    setTimeout(()=>alert('Explosion magique ! 🌟'),200);
    // nouvelle question
    a = Math.floor(Math.random()*9)+1;
    b = Math.floor(Math.random()*9)+1;
    document.querySelector('#a').textContent=a;
    document.querySelector('#b').textContent=b;
    zoneB.innerHTML='';zoneR.innerHTML='';
    plateau.innerHTML='';
    genererCubes(a, zoneB, 'bleu');
    genererCubes(b, zoneR, 'rouge');
    input.value='';
  }else{
    alert('Compte bien les cubes sur le plateau.');
  }
});

// Mode DYS
modeBtn.addEventListener('click',()=>document.body.classList.toggle('dys'));

// CSS animation
const style=document.createElement('style');
style.textContent=`
@keyframes explose{
  0%{transform:scale(0);opacity:1}
  100%{transform:scale(4);opacity:0}
}`;
document.head.appendChild(style);
