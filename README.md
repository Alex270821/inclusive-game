# 🐰🐇 Léo & Luna — Jeu éducatif inclusif

Plateforme d'apprentissage adaptatif et magique pour le primaire (CP → CM2).
Jeu inclusif (deux héros au choix : **Léo** et **Luna**), avec mode hors-ligne (PWA),
tuteur socratique IA et mode classe.

> 📂 **Le jeu est dans le dossier [`leo-luna/`](leo-luna/).**
> Voir [`leo-luna/README.md`](leo-luna/README.md) pour les détails techniques.

## Structure du dépôt

```
.
├── leo-luna/                 # ⭐ LE JEU (projet principal)
│   ├── MathsCP_Lapin.html    #   le jeu complet (PWA)
│   ├── sw.js                 #   service worker (hors-ligne)
│   ├── manifest.json         #   métadonnées PWA (installable)
│   ├── icon.svg              #   icône de l'app
│   ├── server.js             #   serveur local + tuteur IA (/api/tuteur)
│   ├── api/classe.js         #   mode classe (Supabase, serverless)
│   ├── docs/                 #   cahier des charges
│   └── README.md             #   doc technique du jeu
│
└── archive/
    └── ancien-prototype/     # 🗄️ ancien jeu (l'an dernier) — conservé, non maintenu
```

## Travailler depuis ordinateur ET téléphone

Tout le projet est sur GitHub. Pour continuer avec Claude Code depuis ton
téléphone, ouvre la session sur le dépôt `inclusive-game` (branche `main`) :
tous les fichiers ci-dessus seront là.

## Reste à faire

Principaux points : fournir les images/sons d'origine, choisir le périmètre des
fonctionnalités IA/paiement, et mettre en place l'hébergement (ordi/tablette/iPhone).
