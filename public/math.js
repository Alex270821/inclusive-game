const svg      = document.getElementById('chateau');
const dragon   = document.getElementById('dragon');
const zone     = document.getElementById('zoneCubes');
const plateau  = document.getElementById('plateau');
const input    = document.getElementById('reponse');
const valider  = document.getElementById('valider');
const son      = document.getElementById('sonReussite');
const modeBtn  = document.getElementById('modeDys');

let a = 6, b = 4;

// Génère cubes 3D
function genererCubes(n, parent){
  parent.innerHTML='';
  for(let i=0;i<n;i++){
    const cube = document.createElement('div');
    cube.className='cube-3d';
    cube.draggable = true;
    parent.appendChild(cube);
  }
}
genererCubes(a, zone);
genererCubes(b, zone);

// Drag & drop
zone.addEventListener('dragstart',e=>{
  if(e.target.classList.contains('cube-3d')){
    e.dataTransfer.setData('text/plain','cube');
  }
});
plateau.addEventListener('dragover',e=>e.preventDefault());
plateau.addEventListener('drop',e=>{
  e.preventDefault();
  const cube = document.createElement('div');
  cube.className='cube-3d';
  plateau.appendChild(cube);
});

// Validation
valider.addEventListener('click',()=>{
  const total = plateau.children.length;
  if(total === a + b){
    son.play();
    // animation dragon
    dragon.style.transform='translate(480px, 200px) scale(3)';
    // feux d’artifice
    for(let i=0;i<40;i++){
      const feu=document.createElement('div');
      feu.style.position='absolute';
      feu.style.left=Math.random()*900+'px';
      feu.style.top=Math.random()*550+'px';
      feu.style.width='8px';feu.style.height='8px';
      feu.style.background='#'+Math.floor(Math.random()*16777215).toString(16);
      feu.style.borderRadius='50%';
      feu.style.animation='explose 1s forwards';
      document.body.appendChild(feu);
      setTimeout(()=>feu.remove(),1000);
    }
    setTimeout(()=>alert('Explosion magique ! 🌟'),100);
    // nouvelle question
    a = Math.floor(Math.random()*9)+1;
    b = Math.floor(Math.random()*9)+1;
    document.getElementById('a').textContent=a;
    document.getElementById('b').textContent=b;
    plateau.innerHTML='';
    genererCubes(a+b, zone);
    input.value='';
  }else{
    alert('Compte les cubes sur le plateau.');
  }
});

// Mode DYS
modeBtn.addEventListener('click',()=>document.body.classList.toggle('dys'));

// CSS animation
const style=document.createElement('style');
style.textContent=`
@keyframes explose{
  0%{transform:scale(0);opacity:1}
  100%{transform:scale(3);opacity:0}
}`;
document.head.appendChild(style);
