# 🐰🐇 Léo & Luna — Les Maths avec Léo & Luna

Version avancée du jeu éducatif (PWA hors-ligne) avec tuteur socratique IA et
mode classe. Ces fichiers ont été intégrés au dépôt et regroupés ici.

## Structure

```
leo-luna/
├── MathsCP_Lapin.html   # Le jeu complet (PWA, ~25 000 lignes)
├── sw.js                # Service Worker — cache hors-ligne (cache leo-maths-v62)
├── server.js            # Serveur local Node : fichiers statiques + tuteur Claude
├── api/
│   └── classe.js        # Fonction serverless (Vercel) — Mode Classe via Supabase
└── docs/
    └── CahierDesCharges_LeoLuna.html  # Cahier des charges de la plateforme
```

## Rôle de chaque fichier

| Fichier | Rôle |
|---|---|
| `MathsCP_Lapin.html` | L'application jouable. Servie à la racine `/` par `server.js`. |
| `sw.js` | Service Worker PWA. Stratégie *network-first* pour le HTML, *cache-first* pour les images/polices/icônes. Les routes `/api/` passent toujours par le réseau. |
| `server.js` | Serveur HTTP local (port **3456**). Sert les fichiers statiques et expose la route `POST /api/tuteur` (tuteur socratique Claude Haiku) avec garde-fous anti-abus (max 30 appels/session, budget ~0,50 €/jour). |
| `api/classe.js` | Endpoint serverless « Mode Classe ». Actions : `creer`, `rejoindre`, `sync`, `event`, `stats-eleve`. Persistance via Supabase. |
| `docs/CahierDesCharges_LeoLuna.html` | Document de spécifications (vision, marché, pédagogie, roadmap, KPIs). |

## Variables d'environnement

`server.js` (tuteur IA) :

| Variable | Description |
|---|---|
| `ANTHROPIC_API_KEY` | Clé API Anthropic (tuteur socratique Claude). |

`api/classe.js` (mode classe Supabase) :

| Variable | Description |
|---|---|
| `SUPABASE_URL` | URL du projet Supabase. |
| `SUPABASE_SERVICE_KEY` | Clé `service_role` (privée, côté serveur uniquement). |

> ⚠️ Ne jamais committer ces clés. Utiliser un fichier `.env` local (ignoré par git).

## Lancer en local

```bash
cd leo-luna
# définir ANTHROPIC_API_KEY dans l'environnement ou un .env
node server.js
# → http://localhost:3456
```

## Notes

- Les chemins d'assets référencés par `sw.js` et le jeu (`/images/...`, `/lottie/...`,
  `/manifest.json`, `/icon.svg`) ne sont pas encore présents dans le dépôt : le
  `Promise.allSettled` du Service Worker tolère les fichiers manquants, mais la PWA
  ne sera pleinement hors-ligne qu'une fois ces ressources ajoutées.
- Le fichier `classe.js` était fourni en double (deux copies identiques) ; une seule
  a été conservée ici.
