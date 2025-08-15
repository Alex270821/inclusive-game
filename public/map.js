document.querySelectorAll('.spot').forEach(spot=>{
  spot.addEventListener('click',()=>{
    const place = spot.dataset.place;
    localStorage.setItem('place',place);
    window.location.href='mini-game.html';
  });
});
