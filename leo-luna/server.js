require('dotenv').config();
const http    = require('http');
const fs      = require('fs');
const path    = require('path');
const https   = require('https');

const PORT    = 3456;
const API_KEY = process.env.ANTHROPIC_API_KEY;

// Compteur de sécurité anti-abus
const compteurs = {}; // { sessionId: { appels: N, reset: timestamp } }
const MAX_APPELS_SESSION = 30;  // max 30 hints par session
const BUDGET_JOUR_CENTIMES = 50; // max 0,50€/jour
let depenseJour = 0;
let dernierReset = Date.now();

function resetBudgetSiNouvelleJournee() {
  const maintenant = Date.now();
  if (maintenant - dernierReset > 86400000) {
    depenseJour = 0;
    dernierReset = maintenant;
  }
}

// Types MIME pour les fichiers statiques
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.mp3':  'audio/mpeg',
  '.wav':  'audio/wav',
};

// ===== PROMPT SOCRATIQUE =====
function construirePrompt(contexte) {
  const { moduleNom, consigne, bonneReponse, reponseEnfant, nomEnfant, perso } = contexte;
  const prenom = nomEnfant || 'toi';
  const personnage = perso === 'luna' ? 'Luna la magicienne' : 'Léo le magicien';

  return `Tu es ${personnage}, un personnage de jeu éducatif qui aide des enfants de 6 ans (CP) à apprendre les mathématiques.

Un enfant nommé ${prenom} vient de faire une erreur.

Module : ${moduleNom}
Question posée : ${consigne}
Bonne réponse : ${bonneReponse}
Réponse de l'enfant : ${reponseEnfant}

Ta mission SOCRATIQUE : NE DONNE JAMAIS la bonne réponse directement.
Pose UNE SEULE question simple qui guide l'enfant vers la découverte.

Règles ABSOLUES :
- Maximum 2 phrases courtes (enfant de 6 ans)
- Vocabulaire très simple, concret, visuel
- Parle à la 1ère personne comme ${personnage}
- Termine toujours par une question qui aide à réfléchir
- JAMAIS de "Bravo" ou encouragement (on corrige d'abord)
- JAMAIS la bonne réponse en clair

VISUELS — quand tu veux MONTRER quelque chose, insère UN tag dans ta réponse :
  [MONTRE:doigts:N]  → affiche N doigts levés (N entre 1 et 10)
  [MONTRE:cadre:N]   → affiche un cadre de 10 avec N cases remplies
  [MONTRE:cubes:N]   → affiche N cubes colorés
Exemple : "Lève [MONTRE:doigts:7] sept doigts... combien en manque-t-il pour avoir 10 ?"
Le tag sera retiré du texte lu à voix haute et remplacé par une image animée.
N'utilise un tag QUE si ça aide vraiment l'enfant à visualiser.

Réponds avec le texte de ${personnage}, avec au maximum 1 tag visuel.`;
}

// ===== APPEL CLAUDE API =====
function appelClaude(prompt, callback) {
  const body = JSON.stringify({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 120,
    messages: [{ role: 'user', content: prompt }]
  });

  const options = {
    hostname: 'api.anthropic.com',
    path: '/v1/messages',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'Content-Length': Buffer.byteLength(body)
    }
  };

  const req = https.request(options, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        const texte = json.content?.[0]?.text || '';
        // Estimation coût (Haiku : ~$0.0008 / 1000 tokens)
        const tokens = (json.usage?.input_tokens || 0) + (json.usage?.output_tokens || 0);
        depenseJour += (tokens / 1000) * 0.0008 * 100; // en centimes
        callback(null, texte);
      } catch(e) {
        callback('Erreur parsing Claude');
      }
    });
  });
  req.on('error', err => callback(err.message));
  req.write(body);
  req.end();
}

// ===== SERVEUR HTTP =====
const server = http.createServer((req, res) => {
  // CORS pour le jeu en local
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ===== ROUTE : Tuteur socratique =====
  if (req.method === 'POST' && req.url === '/api/tuteur') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      resetBudgetSiNouvelleJournee();

      // Vérifications sécurité
      if (depenseJour >= BUDGET_JOUR_CENTIMES) {
        res.writeHead(429, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ texte: 'Réfléchis bien... Tu peux y arriver !' }));
        return;
      }

      try {
        const ctx = JSON.parse(body);
        const sessionId = ctx.sessionId || 'default';

        // Limite par session
        if (!compteurs[sessionId]) compteurs[sessionId] = { appels: 0 };
        if (compteurs[sessionId].appels >= MAX_APPELS_SESSION) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ texte: 'Regarde bien la question, tu peux le faire !' }));
          return;
        }
        compteurs[sessionId].appels++;

        const prompt = construirePrompt(ctx);
        appelClaude(prompt, (err, texte) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ texte: 'Essaie encore, tu vas y arriver !' }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ texte }));
        });
      } catch(e) {
        res.writeHead(400); res.end('Requête invalide');
      }
    });
    return;
  }

  // ===== FICHIERS STATIQUES =====
  let filePath = path.join(__dirname, req.url === '/' ? 'MathsCP_Lapin.html' : req.url);

  // Sécurité : pas de sortie du dossier
  if (!filePath.startsWith(__dirname)) { res.writeHead(403); res.end(); return; }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Non trouvé'); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  🐰✨ Léo & Luna — Serveur IA démarré !');
  console.log('');
  console.log('  👉 Ouvre le jeu ici : http://localhost:' + PORT);
  console.log('');
  console.log('  🤖 Tuteur Claude actif (Haiku)');
  console.log('  💰 Budget jour : 0 / ' + BUDGET_JOUR_CENTIMES + ' centimes');
  console.log('');
});
