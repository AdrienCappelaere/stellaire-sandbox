# Stellaire Sandbox — Terrain d'entraînement GTM / GA4 / Looker Studio

**Date:** 2026-05-22
**Statut:** Design validé
**Public cible:** Une candidate au poste de Chef de projet SEO ([offre Première.place](https://www.premiere.place/contact/recrutement/chef-projet-seo/)) qui doit rafraîchir ses compétences GTM, GA4, Consent Mode et Looker Studio avant l'entretien.

## 1. Objectif

Fournir un environnement réaliste où la candidate peut pratiquer de bout en bout les compétences techniques mises en avant dans la fiche de poste:

- **Audits SEO** techniques, ergonomiques et éditoriaux sur un site réel
- Formulation de recommandations actionnables (titles, meta, balisage, contenu, UX)
- Maîtrise de Google Tag Manager (création de conteneur, tags, triggers, variables, custom events)
- Implémentation de Google Analytics 4 (config, événements e-commerce, événements custom)
- Gestion de la conformité cookies (CMP + Consent Mode v2)
- Vérification (Tag Assistant, DebugView, Realtime)
- Construction d'un dashboard Looker Studio (anciennement Data Studio)

Le projet est **un terrain de jeu, pas un cours**: il fournit un site contenant des problèmes SEO réalistes à découvrir, les exercices et les critères de validation. Les ressources théoriques restent celles, officielles, de Google. Le parcours suit l'ordre d'une mission agence réelle: **auditer, recommander, instrumenter, mesurer**.

## 2. Périmètre

### Inclus

- Un site e-commerce fictif "Stellaire" (boutique d'astronomie) déployé en production sur Vercel, **contenant des problèmes SEO plantés intentionnellement** (technique, ergonomique, éditorial)
- Un cahier d'exercices guidé en 8 étapes (audit puis instrumentation)
- Une solution de référence privée (sur la machine de l'organisateur uniquement), incluant **la liste exhaustive des issues plantées** avec leur localisation et la recommandation attendue

### Hors périmètre

- Création des comptes Google (GTM, GA4, Looker Studio): la candidate les crée elle-même (c'est attendu)
- Documentation théorique sur GA4/GTM: usage des docs officielles Google
- Notation automatique des exercices: débrief en direct par l'organisateur
- Backend réel, paiement réel, gestion d'utilisateurs

## 3. Architecture

```
stellaire-sandbox/
├── site/                      # Site fictif déployé (public)
│   ├── index.html             # Accueil
│   ├── catalogue.html         # Liste produits + filtres catégorie
│   ├── produit.html           # Fiche produit (lit le slug en query string)
│   ├── panier.html
│   ├── checkout.html          # Checkout factice (formulaire fake)
│   ├── confirmation.html      # ?order=XXX
│   ├── blog/
│   │   ├── index.html
│   │   ├── choisir-premier-telescope.html
│   │   └── objets-celestes-du-mois.html
│   ├── contact.html
│   ├── mentions-legales.html
│   ├── politique-cookies.html # Page vide à compléter par la candidate
│   ├── assets/
│   │   ├── css/               # Tailwind via CDN, custom styles minimes
│   │   ├── js/
│   │   │   ├── data.js        # Catalogue produits (12 produits)
│   │   │   ├── cart.js        # Logique panier LocalStorage
│   │   │   ├── tracking.js    # dataLayer.push pré-câblés
│   │   │   └── app.js         # Rendu des pages
│   │   └── img/               # Images NASA libres de droits
│   └── robots.txt
├── exercises/                 # Cahier d'exercices (public)
│   ├── README.md              # Vue d'ensemble, prérequis, organisation
│   ├── 01-audit-seo.md        # Audit technique + ergonomique + éditorial
│   ├── 02-installer-gtm.md
│   ├── 03-configurer-ga4.md
│   ├── 04-events-ecommerce.md
│   ├── 05-event-custom.md
│   ├── 06-cmp-consent-mode.md
│   ├── 07-verification.md
│   └── 08-dashboard-looker-studio.md
├── reference/                 # GITIGNORÉ — solution de référence
│   ├── README.md
│   ├── audit-issues.md        # Liste exhaustive des problèmes plantés (localisation + reco)
│   ├── gtm-container-export.json
│   ├── looker-studio-template.md
│   └── notes-debrief.md
├── docs/superpowers/specs/    # Ce document
├── .gitignore                 # exclut reference/
├── README.md                  # Présentation publique du projet
└── vercel.json                # Config déploiement (static, redirects si besoin)
```

## 4. Le site Stellaire — spécification fonctionnelle

### 4.1 Identité

- **Nom:** Stellaire
- **Tagline:** "Le ciel à portée de main"
- **Activité:** Boutique en ligne d'astronomie et observation du ciel
- **Ton:** sobre, esthétique cosmique (fond sombre, accents bleu/violet), photos NASA en libre

### 4.2 Catalogue (12 produits, 4 catégories)

| Catégorie | Exemples | Gamme prix |
|---|---|---|
| Télescopes | Télescope débutant, Dobson 200mm, lunette astronomique | 150–800 € |
| Observation | Jumelles 10x50, oculaires, filtres lunaires | 30–250 € |
| Livres & cartes | Atlas du ciel, guide étoiles, carte tournante | 15–45 € |
| Posters & déco | Posters NASA, mug constellations, t-shirt voie lactée | 12–35 € |

Le catalogue (titres, descriptions, prix, ID, catégorie, image) est défini dans `assets/js/data.js` — un simple tableau JS exporté en global.

### 4.3 Pages et parcours

- **Accueil:** hero, 3 catégories en vedette, 4 produits "coups de cœur", footer
- **Catalogue:** grille produits + filtre par catégorie (côté client, JS)
- **Fiche produit:** image, titre, prix, description, bouton "Ajouter au panier"; CTA secondaire "Voir nos coups de cœur" (sert d'élément cible pour l'événement custom de l'exercice 4)
- **Panier:** liste, modification quantité, suppression, total, bouton checkout
- **Checkout:** formulaire factice (nom, email, adresse, CB factice — pas de validation réelle), bouton "Confirmer"
- **Confirmation:** message + numéro de commande factice (généré côté client); déclenche `purchase`
- **Blog:** 2 articles de fond pour avoir du contenu non-marchand
- **Contact:** formulaire (nom, email, message); déclenche `generate_lead` à la soumission
- **Mentions légales:** texte standard
- **Politique cookies:** page volontairement vide — la candidate l'enrichit lors de l'exercice 6 (CMP)

### 4.4 Hooks de tracking pré-câblés

Le fichier `tracking.js` expose une API `window.stellaire.track(eventName, payload)` qui pousse dans `window.dataLayer`. Tous les événements suivent le schéma GA4 e-commerce recommandé:

| Événement | Déclenchement | Payload clés |
|---|---|---|
| `view_item` | Affichage fiche produit | `currency`, `value`, `items[]` |
| `add_to_cart` | Clic "Ajouter au panier" | idem + `items[]` enrichi |
| `remove_from_cart` | Suppression dans panier | idem |
| `view_cart` | Ouverture page panier | idem |
| `begin_checkout` | Ouverture checkout | idem |
| `purchase` | Confirmation de commande | `transaction_id`, `value`, `tax`, `shipping`, `items[]` |
| `generate_lead` | Soumission formulaire contact | `form_id` |
| `sign_up` | Soumission newsletter | `method: "newsletter"` |

**Le site ne contient AUCUN snippet GTM ni GA4 par défaut.** Le `dataLayer` est initialisé (`window.dataLayer = window.dataLayer || []`), les pushs sont là, mais rien ne les consomme. C'est ce que la candidate ajoute.

### 4.5 Événement custom (exercice 4)

L'exercice impose un événement **à câbler uniquement via GTM (Triggers + Variables), sans modifier le code source du site**.

Deux cibles possibles présentes dans le code:
- Clic sur le CTA `[data-testid="coup-de-coeur"]` en fiche produit (Trigger: Click — All Elements + condition CSS selector)
- Scroll 75% sur la fiche produit (Trigger: Scroll Depth)

Le cahier d'exercices propose les deux et lui demande d'en réaliser un (au choix), puis de l'envoyer en tant qu'événement GA4 nommé `coup_de_coeur_click` ou `deep_scroll`.

### 4.6 Problèmes SEO plantés intentionnellement

Le site contient ~20 issues réparties sur trois axes pour servir de matière à l'audit (étape 1). La spec ci-dessous décrit les **catégories**; la **liste exhaustive avec localisation page-par-page** est dans `reference/audit-issues.md` (privée) pour ne pas spoiler l'exercice.

**Axe technique (~8 issues):**

- `<title>` problématiques: un dupliqué entre deux fiches produit, un trop long (>70 car), une page sans title
- Meta descriptions: une page sans meta description, une dupliquée, une trop courte
- Hiérarchie Hn: une page avec deux H1, une page avec un H3 sans H2 parent
- Image lourde non optimisée (>2 Mo) sur une fiche produit; plusieurs images sans `alt` ou avec alt vide
- `lang` attribute manquant sur `<html>` d'une page
- Canonical manquant sur une page accessible via deux URLs (avec et sans trailing slash, ou avec un paramètre `?ref=`)
- `robots.txt` bloquant `/blog/` (erreur volontaire)
- Pas de `sitemap.xml`, ou sitemap présent mais incomplet
- JSON-LD `Product` cassé sur une fiche (champ obligatoire manquant ou syntaxe invalide)
- Lien interne 404 dans le footer ou un article de blog

**Axe ergonomique (~5 issues):**

- CTA principal "Ajouter au panier" avec contraste insuffisant (échec WCAG AA)
- Formulaire contact: labels manquants (uniquement `placeholder`), pas de message d'erreur visible
- Pas de feedback visuel après "Ajouter au panier" (l'utilisateur ne sait pas si ça a fonctionné)
- Mobile: zone de tap d'un lien important < 44px, ou texte qui déborde
- Page checkout: pas d'indicateur d'étape, bouton "Confirmer" placé après une zone qui semble être un footer

**Axe éditorial (~7 issues):**

- Cannibalisation de mots-clés: les deux articles de blog ciblent involontairement la même requête principale ("meilleur télescope débutant")
- Titres SEO non optimisés: marque "Stellaire" placée en début de title au lieu de la requête cible
- Une fiche produit sans description rédigée (juste les specs techniques, contenu < 50 mots)
- Maillage interne défaillant: les articles de blog ne pointent vers aucune fiche produit; aucune fiche produit ne pointe vers les guides
- Anchor texts génériques ("cliquez ici", "en savoir plus") sur plusieurs CTA
- Article de blog daté ("…ce mois-ci") mais sans date publiée affichée
- Page "Mentions légales" indexable et listée dans le sitemap au lieu d'être en `noindex`

L'objectif n'est pas qu'elle trouve absolument les 20 — c'est qu'elle structure sa démarche (méthode, outils utilisés, priorisation), qu'elle en identifie une majorité et qu'elle propose des recommandations actionnables.

## 5. Le cahier d'exercices

Huit fichiers Markdown, structure identique pour chacun:

```markdown
# Étape N — Titre

## Objectif
Phrase qui dit ce qu'elle doit avoir fait à la fin.

## Pré-requis
Ce qui doit être en place avant de commencer (étapes précédentes, comptes).

## Marche à suivre (haut niveau)
Pas un tutoriel détaillé — des jalons. Pointe vers les ressources officielles.

## Livrable attendu
Ce qu'on doit pouvoir constater à la fin (capture, URL, comportement).

## Critères de validation
Liste à cocher mesurable (ex: "Le tag GA4 Configuration apparaît dans Tag Assistant",
"L'événement purchase remonte dans GA4 DebugView avec la bonne value").

## Pièges classiques
3–5 erreurs typiques avec leur signal (ex: "Si le dataLayer.push arrive AVANT que
le tag GA4 Config soit déclenché, l'événement ne sera pas attribué").

## Ressources
Liens vers la documentation Google officielle, jamais vers des tutos tiers.
```

### Vue d'ensemble des 8 étapes

1. **Audit SEO** — Mener un audit complet du site Stellaire sur les trois axes (technique, ergonomique, éditorial). Outils suggérés: inspection manuelle, DevTools Chrome, Lighthouse, Screaming Frog (version gratuite jusqu'à 500 URLs), Search Console (une fois le site vérifié), validateur Schema.org. Livrable: un rapport Markdown structuré par axe, avec pour chaque issue: localisation (URL + élément), constat, impact estimé, recommandation actionnable, priorité (P1/P2/P3). Format inspiré d'un livrable agence réel.
2. **Installer GTM** — Créer compte/conteneur Web, poser le snippet sur le site (Vercel: via edit du HTML + redéploiement), vérifier en preview.
3. **Configurer GA4** — Créer propriété GA4, créer le tag GA4 Configuration dans GTM, vérifier les hits dans Realtime.
4. **Events e-commerce** — Créer un tag GA4 Event par événement (ou un seul tag paramétré par variable), récupérer les paramètres depuis le `dataLayer`, valider chaque event en DebugView.
5. **Event custom** — Choisir clic CTA ou scroll 75%, configurer le trigger GTM, envoyer en GA4, valider.
6. **CMP + Consent Mode v2** — Intégrer une CMP (tarteaucitron, Axeptio ou Cookiebot freemium), configurer le default consent (denied), gérer l'update au consentement, vérifier que les tags GTM respectent le consent state.
7. **Vérification bout-en-bout** — Parcourir un parcours complet (browse → add → checkout → purchase) en Preview Mode, croiser Tag Assistant + GA4 DebugView + Realtime, documenter ce qui passe et ce qui rate.
8. **Dashboard Looker Studio** — Connecter GA4, construire un dashboard 1 page avec: sessions par source/medium, taux de conversion global, top 5 produits par revenue, funnel `view_item → add_to_cart → begin_checkout → purchase`.

## 6. Solution de référence (privée)

Dossier `reference/`, **gitignoré**, contient:

- `audit-issues.md`: liste exhaustive des problèmes plantés (URL exacte, élément concerné, type d'issue, recommandation attendue, priorité). Sert de grille de correction pour le débrief de l'étape 1.
- `gtm-container-export.json`: export du conteneur GTM tel que l'organisateur l'aurait configuré (référence pour le débrief)
- `looker-studio-template.md`: lien vers un template Looker Studio + screenshots du résultat attendu
- `notes-debrief.md`: notes sur ce qu'il faut chercher dans le travail rendu, questions à poser en débrief

## 7. Stack technique

- **Site:** HTML/CSS/JS vanilla, Tailwind via CDN (zéro build, zéro npm), images NASA
- **Hébergement:** Vercel (static, déploiement automatique depuis GitHub)
- **Repo:** GitHub public
- **Pas de:** framework JS, bundler, backend, base de données, paiement réel

Ce choix est délibéré: la candidate doit pouvoir cloner, lire, comprendre et modifier le site sans setup. Et l'organisateur ne veut pas maintenir une stack lourde pour un projet one-shot.

## 8. Livrables et responsabilités

| Livrable | Qui | Quand |
|---|---|---|
| Repo GitHub + site déployé sur Vercel (avec issues SEO plantées) | Organisateur (Adrien) | Avant de partager à la candidate |
| Cahier d'exercices complet (8 fichiers) | Organisateur | Idem |
| Solution de référence (incluant `audit-issues.md`) | Organisateur | Idem, gardée privée |
| Rapport d'audit SEO | Candidate | Étape 1 |
| Création comptes GTM/GA4/Looker | Candidate | Étape 2–3 |
| Réalisation des 8 exercices | Candidate | Avant l'entretien |
| Débrief (1h–2h) | Adrien + candidate | Après réalisation |

## 9. Critères de succès du projet

- La candidate produit un **rapport d'audit SEO structuré** (technique + ergo + éditorial) avec recommandations priorisées, et identifie au moins 70% des issues plantées
- Elle produit, en autonomie, un conteneur GTM fonctionnel sur le site déployé, avec GA4 + CMP + dashboard
- À la fin, elle peut expliquer chaque choix qu'elle a fait à un recruteur technique (pourquoi tel trigger, pourquoi tel paramètre, comment elle a vérifié, pourquoi telle reco d'audit est P1 plutôt que P2)
- Elle se sent à l'aise sur le vocabulaire spécifique GTM/GA4 ("tag de configuration", "consent mode default vs update", "trigger CSS selector", "dimension custom") et SEO ("cannibalisation", "canonical", "maillage interne", "balisage Schema") au moment de l'entretien
- Elle peut présenter le projet **comme un case study en entretien**: "voici un site que j'ai audité et instrumenté de A à Z, voici les issues que j'ai identifiées, voici comment j'ai mesuré l'impact" — démonstration de compétences de bout en bout
