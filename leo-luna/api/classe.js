// api/classe.js — Mode Classe Supabase
// Actions : creer | rejoindre | sync | vue-classe | generer-code
const https = require('https');

const SB_URL  = process.env.SUPABASE_URL;
const SB_KEY  = process.env.SUPABASE_SERVICE_KEY; // service_role key (privé, côté serveur)

function sbRequest(method, path, body) {
  return new Promise((resolve, reject) => {
    const url = new URL(SB_URL + '/rest/v1/' + path);
    const bodyStr = body ? JSON.stringify(body) : null;
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'apikey': SB_KEY,
        'Authorization': 'Bearer ' + SB_KEY,
        'Content-Type': 'application/json',
        'Prefer': method === 'POST' ? 'return=representation' : 'return=representation',
      }
    };
    if (bodyStr) options.headers['Content-Length'] = Buffer.byteLength(bodyStr);
    const req = https.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: data ? JSON.parse(data) : null }); }
        catch(e) { resolve({ status: res.statusCode, body: data }); }
      });
    });
    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

function genCode() {
  // Code 6 chiffres lisible (sans 0/O/1/I pour éviter confusion)
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  if (!SB_URL || !SB_KEY) {
    res.status(503).json({ error: 'Supabase non configuré (SUPABASE_URL + SUPABASE_SERVICE_KEY)' });
    return;
  }

  // ── GET /api/classe?test=1  →  vérification connexion Supabase
  if (req.method === 'GET') {
    const params = new URL('http://x' + req.url).searchParams;
    const code = (req.query && req.query.code) || params.get('code');
    const test = (req.query && req.query.test) || params.get('test');

    if (test) {
      const r = await sbRequest('GET', 'classes?select=count&limit=1');
      if (r.status >= 400) {
        res.status(500).json({ ok: false, error: 'Connexion Supabase échouée', detail: r.body });
      } else {
        res.status(200).json({ ok: true, message: 'Supabase connecté ✓' });
      }
      return;
    }

    if (!code) { res.status(400).json({ error: 'code manquant' }); return; }

    const classeR = await sbRequest('GET', `classes?code=eq.${code.toUpperCase()}&select=*`);
    if (!classeR.body || !classeR.body.length) {
      res.status(404).json({ error: 'Classe introuvable' }); return;
    }
    const classe = classeR.body[0];
    const elevesR = await sbRequest('GET', `eleves?classe_id=eq.${classe.id}&select=*&order=nom`);
    res.status(200).json({ classe, eleves: elevesR.body || [] });
    return;
  }

  if (req.method !== 'POST') { res.status(405).end(); return; }

  // Vercel auto-parse JSON bodies → req.body est déjà un objet
  let data = req.body;
  if (!data || typeof data !== 'object') {
    // Fallback : lire le stream manuellement (rare)
    let raw = '';
    await new Promise(r => { req.on('data', c => raw += c); req.on('end', r); });
    try { data = JSON.parse(raw); } catch(e) { res.status(400).json({ error: 'JSON invalide' }); return; }
  }

  const { action } = data;

  // ── Créer une classe
  if (action === 'creer') {
    const { nom, enseignant } = data;
    if (!nom) { res.status(400).json({ error: 'nom manquant' }); return; }

    let code, tentatives = 0;
    while (tentatives < 5) {
      code = genCode();
      const check = await sbRequest('GET', `classes?code=eq.${code}&select=id`);
      if (!check.body || !check.body.length) break;
      tentatives++;
    }

    const r = await sbRequest('POST', 'classes', { code, nom, enseignant: enseignant || '' });
    if (r.status >= 400) { res.status(500).json({ error: 'Erreur création classe', detail: r.body }); return; }
    res.status(200).json({ ok: true, code, classe: r.body[0] });
    return;
  }

  // ── Rejoindre une classe (créer ou mettre à jour l'élève)
  if (action === 'rejoindre') {
    const { code, nom, perso } = data;
    if (!code || !nom) { res.status(400).json({ error: 'code et nom requis' }); return; }

    const classeR = await sbRequest('GET', `classes?code=eq.${code.toUpperCase()}&select=*`);
    if (!classeR.body || !classeR.body.length) {
      res.status(404).json({ error: 'Code de classe invalide' }); return;
    }
    const classe = classeR.body[0];

    // Upsert élève (nom unique dans la classe)
    const upsertR = await sbRequest('POST', 'eleves', {
      classe_id: classe.id, nom, perso: perso || 'leo',
      progression: {}, jours_joues: [], updated_at: new Date().toISOString()
    });
    // Si conflit (élève existe déjà), on le récupère
    let eleve;
    if (upsertR.status === 409 || upsertR.status === 422) {
      const existR = await sbRequest('GET', `eleves?classe_id=eq.${classe.id}&nom=eq.${encodeURIComponent(nom)}&select=*`);
      eleve = existR.body && existR.body[0];
    } else {
      eleve = upsertR.body && upsertR.body[0];
    }
    if (!eleve) { res.status(500).json({ error: 'Erreur création élève' }); return; }
    res.status(200).json({ ok: true, eleve_id: eleve.id, classe_nom: classe.nom, eleve });
    return;
  }

  // ── Synchroniser la progression
  if (action === 'sync') {
    const { eleve_id, progression, jours_joues, difficulte, erreurs_par_module } = data;
    if (!eleve_id) { res.status(400).json({ error: 'eleve_id requis' }); return; }

    const payload = {
      progression:        progression        || {},
      jours_joues:        jours_joues        || [],
      updated_at:         new Date().toISOString(),
    };
    if (difficulte)         payload.difficulte         = difficulte;
    if (erreurs_par_module) payload.erreurs_par_module = erreurs_par_module;

    const r = await sbRequest('PATCH', `eleves?id=eq.${eleve_id}`, payload);
    if (r.status >= 400) { res.status(500).json({ error: 'Erreur sync', detail: r.body }); return; }
    res.status(200).json({ ok: true });
    return;
  }

  // ── Enregistrer un événement (question individuelle)
  if (action === 'event') {
    const { eleve_id, module: mod, phoneme, type_question, resultat, duree_ms } = data;
    if (!eleve_id || !mod) { res.status(400).json({ error: 'eleve_id et module requis' }); return; }

    const r = await sbRequest('POST', 'evenements', {
      eleve_id, module: mod,
      phoneme:       phoneme       || null,
      type_question: type_question || null,
      resultat:      typeof resultat === 'number' ? resultat : null,
      duree_ms:      typeof duree_ms === 'number' ? duree_ms : null,
    });
    if (r.status >= 400) { res.status(500).json({ error: 'Erreur event', detail: r.body }); return; }
    res.status(200).json({ ok: true });
    return;
  }

  // ── Stats phonèmes d'un élève (pour le heatmap enseignant)
  if (action === 'stats-eleve') {
    const { eleve_id } = data;
    if (!eleve_id) { res.status(400).json({ error: 'eleve_id requis' }); return; }

    const r = await sbRequest('GET',
      `evenements?eleve_id=eq.${eleve_id}&select=phoneme,resultat,type_question,created_at&order=created_at.desc&limit=500`
    );
    if (r.status >= 400) { res.status(500).json({ error: 'Erreur stats' }); return; }
    const events = r.body || [];

    // Agréger par phonème
    const par_phoneme = {};
    events.forEach(ev => {
      if (!ev.phoneme) return;
      if (!par_phoneme[ev.phoneme]) par_phoneme[ev.phoneme] = { ok: 0, ko: 0 };
      if (ev.resultat === 1) par_phoneme[ev.phoneme].ok++;
      else                   par_phoneme[ev.phoneme].ko++;
    });

    res.status(200).json({ ok: true, par_phoneme, total_events: events.length });
    return;
  }

  res.status(400).json({ error: 'action inconnue' });
};
