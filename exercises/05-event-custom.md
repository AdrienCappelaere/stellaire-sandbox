# Étape 5 — Ajouter un événement custom (sans toucher au code)

## Objectif

Configurer dans GTM, **sans modifier le code du site**, un événement custom qui mesure soit un clic spécifique soit un scroll profond. L'envoyer à GA4. Valider en DebugView.

## Pré-requis

- Étape 4 terminée

## Choisir une cible (une suffit)

**Option A — Clic sur le CTA "Voir nos coups de cœur" en fiche produit**
- Sélecteur : `[data-testid="coup-de-coeur"]`
- Le bouton est présent sur toutes les fiches produit

**Option B — Scroll 75% sur une fiche produit**
- Tu utilises le déclencheur natif "Scroll Depth"

## Marche à suivre — Option A (clic CTA)

### 1. Activer les variables intégrées de clic

1. Variables → "Configurer" (à droite des variables intégrées) → coche au minimum :
   - `Click Element`
   - `Click Classes`
   - `Click Target`
   - `Click URL`

### 2. Créer un déclencheur "Click — All Elements"

1. Déclencheurs → Nouveau → type **Click — All Elements**.
2. Cette déclenche se produit sur : **Some Clicks**.
3. Condition : `Click Element` → **matches CSS selector** → `[data-testid="coup-de-coeur"]`.
4. Nom : "Click — Coup de cœur".

### 3. Créer le tag GA4 Event

1. Tag GA4 Event :
   - Event Name : `coup_de_coeur_click`
   - Paramètre suggéré : `link_text` → `{{Click Text}}` (variable intégrée à activer)
2. Déclencheur : "Click — Coup de cœur".
3. Nom : "GA4 — coup_de_coeur_click".

## Marche à suivre — Option B (scroll 75%)

### 1. Créer un déclencheur "Scroll Depth"

1. Déclencheurs → Nouveau → type **Scroll Depth**.
2. Vertical Scroll Depths : Percentages → 75.
3. Cette déclenche se produit sur : Pages ayant `Page Path` contenant `/produit/` (variable intégrée `Page Path`).
4. Nom : "Scroll — Fiche produit 75%".

### 2. Créer le tag GA4 Event

1. Tag GA4 Event :
   - Event Name : `deep_scroll`
   - Paramètres : `percent_scrolled` → `{{Scroll Depth Threshold}}`
2. Déclencheur : "Scroll — Fiche produit 75%".

## Tester et publier

1. Mode Aperçu : exécute l'action (clic ou scroll) sur une fiche produit.
2. Vérifie en DebugView GA4 l'événement (`coup_de_coeur_click` ou `deep_scroll`) avec ses paramètres.
3. Publie le conteneur (version "v3 — event custom").

## Livrable attendu

- Capture DebugView GA4 montrant l'événement custom avec ses paramètres

## Critères de validation

- [ ] Déclencheur custom créé (clic CSS selector ou scroll depth)
- [ ] Tag GA4 Event créé, événement nommé en snake_case
- [ ] Événement visible en DebugView avec au moins un paramètre utile
- [ ] Aucune modification du code source du site n'a été nécessaire

## Pièges classiques

- **CSS selector incorrect** : tester d'abord dans la console du site avec `document.querySelector('[data-testid="coup-de-coeur"]')` — si ça renvoie `null`, le selector est faux.
- **Déclencheur "All Clicks" sans condition** : tu enverrais des `click` GA4 sur chaque clic du site. Toujours scoper.
- **Nom d'événement avec espaces ou majuscules** : GA4 normalise tout en snake_case. Reste cohérent.

## Ressources

- [GTM — Click triggers](https://support.google.com/tagmanager/answer/7679320)
- [GTM — Scroll Depth trigger](https://support.google.com/tagmanager/answer/7679626)
- [GA4 — Naming conventions for events](https://support.google.com/analytics/answer/13316687)
