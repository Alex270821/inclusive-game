// Service Worker — Les Maths avec Léo & Luna (PWA hors-ligne)
const CACHE = 'leo-maths-v62';
const ASSETS = [
  '/',
  '/MathsCP_Lapin.html',
  '/manifest.json',
  '/icon.svg',
  '/images/fond_magicien.png',
  '/images/fond_foret_elfique.jpg',
  '/images/fond_bibliotheque_magicien.jpg',
  '/images/canva_soustractions.png',
  '/images/canva_problemes.png',
  '/images/leo_v2.png',
  '/images/leo_v3.png',
  '/images/luna_v3.png',
  '/images/fond_royaume.jpg',
  '/images/fond_classe_magique.jpg',
  '/images/grimoire_canva.png',
  '/images/vase_magique.png',
  '/images/xylophone_magique.png',
  '/images/parchemin_mots_flash.png',
  '/images/bulle_son_voyageur.png',
  '/images/illus_mots_cp.png',
  '/images/grimoire_sons.png',
  '/images/grimoire_syllabes.png',
  '/images/grimoire_lire-syllabes.png',
  '/images/grimoire_sons-composes.png',
  '/images/grimoire_premiers-mots.png',
  '/images/grimoire_lire-histoire.png',
  '/images/coffre_tresor.png',
  '/images/parchemin.png',
  '/images/porte_francais.png',
  '/images/porte_lettres.png',
  '/images/sprites/Cristal_A.png',
  '/images/sprites/Cristal_E.png',
  '/images/sprites/Cristal_I.png',
  '/images/sprites/Cristal_O.png',
  '/images/sprites/Cristal_U.png',
  '/images/sprites/A_arbre__4_-removebg-preview.png',
  '/images/sprites/E_escargot__2_-removebg-preview.png',
  '/images/sprites/I_iris__2_-removebg-preview.png',
  '/images/sprites/O_or.png',
  '/images/sprites/U_uranus.png',
  '/images/sprites/fond_salle_magicien.png',
  '/lottie/robotAnimation.json',
  '/lottie/trophy.json',
  '/lottie/star.json',
  '/lottie/check.json',
  // ── Icônes modules (session Canva) ──────────────────────────────
  '/images/icon-sons.png',
  '/images/icon-lettres.png',
  '/images/icon-syllabes.png',
  '/images/icon-grimoire.png',
  '/images/icon-sons-composes.png',
  '/images/icon-premiers-mots.png',
  '/images/icon-maths.png',
  '/images/icon-additions.png',
  '/images/icon-soustractions.png',
  '/images/icon-comparaisons.png',
  '/images/icon-geometrie.png',
  // ── Badges sorcier ───────────────────────────────────────────────
  '/images/badge-apprenti.png',
  '/images/badge-sorcier.png',
  '/images/badge-grand-sorcier.png',
  // ── Images mots décodables ───────────────────────────────────────
  '/images/mot-chat.png',
  '/images/mot-lapin.png',
  '/images/mot-bateau.png',
  '/images/mot-soleil.png',
  '/images/mot-lune.png',
  '/images/mot-foret.png',
  '/images/mot-zebre.png',
  '/images/mot-chanson.png',
  '/images/mot-jardin.png',
  '/images/mot-montagne.png',
  '/images/mot-feuille.png',
  '/images/mot-bouton.png',
  'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie_light.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(ASSETS.map(a => c.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // L'IA (tuteur, problèmes) doit toujours passer par le réseau, jamais le cache
  if (url.pathname.startsWith('/api/')) return;

  const estNavigation = e.request.mode === 'navigate' || url.pathname === '/' || url.pathname.endsWith('.html');

  // HTML / navigation : NETWORK-FIRST → toujours la dernière version (repli cache hors-ligne)
  if (estNavigation) {
    e.respondWith(
      fetch(e.request).then(resp => {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put('/MathsCP_Lapin.html', clone));
        return resp;
      }).catch(() => caches.match('/MathsCP_Lapin.html').then(r => r || caches.match('/')))
    );
    return;
  }

  // Autres ressources (images, police, icône) : CACHE-FIRST (rapides, rarement modifiées)
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
      if (resp && resp.ok && url.origin === location.origin) {
        const clone = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
      }
      return resp;
    }))
  );
});

