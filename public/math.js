const stock   = document.getElementById('stockBriques');
const mur     = document.getElementById('mur');
const totalIn = document.getElementById('total');
const valider = document.getElementById('valider');
const dragon  = document.getElementById('dragon');
const sonPoser = document.getElementById('sonPoser');
const sonWin   = document.getElementById('sonWin');
const modeBtn  = document.getElementById('modeDys');

let a = 6, b = 4;

// Génère briques
function creerBriques(n, couleur, parent){
  for(let i=0;i<n;i++){
    const b=document.createElement('div');
    b.className='brique '+couleur;
    b.draggable=true;
    parent.appendChild(b);
  }
}
creerBriques(a,'bleu',stock);
creerBriques(b,'rouge',stock);

// Drag & drop
document.addEventListener('dragstart',e=>{
  if(e.target.classList.contains('brique')){
    e.dataTransfer.setData('text','brique');
    sonPoser.play();
  }
});
mur.addEventListener('dragover',e=>e.preventDefault());
mur.addEventListener('drop',e=>{
  e.preventDefault();
  const b=document.createElement('div');
  b.className='brique ' + (stock.children.length > 0 ? 'bleu' : 'rouge');
  mur.appendChild(b);
});

// Validation
valider.addEventListener('click',()=>{
  const total = mur.children.length;
  if(total === a + b){
    sonWin.play();
    // feux d’artifice
    for(let i=0;i<60;i++){
      const f=document.createElement('div');
      f.style.position='absolute';
      f.style.left=Math.random()*1000+'px';
      f.style.top=Math.random()*600+'px';
      f.style.width='8px';f.style.height='8px';
      f.style.background='#'+Math.floor(Math.random()*16777215).toString(16);
      f.style.borderRadius='50%';
      f.style.animation='explose 1.5s forwards';
      document.body.appendChild(f);
      setTimeout(()=>f.remove(),1500);
    }
    // nouvelle question
    a = Math.floor(Math.random()*9)+1;
    b = Math.floor(Math.random()*9)+1;
    document.getElementById('a').textContent=a;
    document.getElementById('b').textContent=b;
    stock.innerHTML='';mur.innerHTML='';
    creerBriques(a,'bleu',stock);
    creerBriques(b,'rouge',stock);
    totalIn.value='';
  }else{
    alert('Compte les briques sur le mur.');
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
