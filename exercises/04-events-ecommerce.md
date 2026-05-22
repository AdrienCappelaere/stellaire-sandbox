# Étape 4 — Brancher les événements e-commerce

## Objectif

Faire remonter dans GA4 les événements e-commerce que le site Stellaire pousse déjà dans `dataLayer` : `view_item`, `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `purchase`. Valider chaque événement en DebugView.

## Pré-requis

- Étape 3 terminée (GA4 reçoit déjà des `page_view`)

## Contexte

Le site Stellaire pousse déjà ces événements dans `window.dataLayer` quand l'utilisateur navigue. Tu peux le vérifier en ouvrant la console et en tapant `dataLayer` après avoir cliqué sur "Ajouter au panier". Ton travail : créer dans GTM les balises qui capturent ces événements et les envoient à GA4, en récupérant les paramètres (`items`, `value`, etc.) depuis le `dataLayer`.

## Marche à suivre

### 1. Créer les variables Data Layer dans GTM

Pour chaque paramètre dont tu auras besoin, tu crées une variable Data Layer.

1. Onglet **Variables** → **Variables définies par l'utilisateur** → **Nouvelle**.
2. Type : **Data Layer Variable**.
3. Crée au minimum :
   - `dlv - ecommerce` → "Nom de la variable Data Layer" : `ecommerce`
   - `dlv - ecommerce.value` → `ecommerce.value`
   - `dlv - ecommerce.items` → `ecommerce.items`
   - `dlv - ecommerce.currency` → `ecommerce.currency`
   - `dlv - ecommerce.transaction_id` → `ecommerce.transaction_id`

### 2. Créer un déclencheur "Custom Event" par événement

1. Onglet **Déclencheurs** → **Nouveau**.
2. Type : **Custom Event**.
3. Pour `view_item` : "Event name" = `view_item`. Coche "All Custom Events" → "Some Custom Events" si tu veux ajouter une condition.
4. Répète pour `add_to_cart`, `remove_from_cart`, `view_cart`, `begin_checkout`, `purchase`.

### 3. Créer un tag GA4 Event par événement

1. Onglet **Balises** → **Nouvelle**.
2. Type : **GA4 Event**.
3. **Configuration tag** : pointe vers ta balise "GA4 — Configuration" (ou renseigne directement ton Measurement ID).
4. **Event Name** : `view_item` (correspond à ce qu'on envoie à GA4).
5. **Event Parameters** : ajoute les paramètres pertinents :
   - `currency` → `{{dlv - ecommerce.currency}}`
   - `value` → `{{dlv - ecommerce.value}}`
   - `items` → `{{dlv - ecommerce.items}}`
6. **Déclencheur** : `view_item`.
7. Nom de la balise : "GA4 — view_item".
8. Répète pour chaque événement, en ajustant les paramètres (pour `purchase`, ajouter `transaction_id`, `tax`, `shipping`).

### 4. Tester en DebugView

1. Mode Aperçu GTM activé, parcours le site : home → fiche produit → ajout panier → checkout → confirmation.
2. Vérifie en DebugView GA4 : chaque événement remonte avec ses paramètres. Clique sur un événement pour voir les `items` détaillés.

### 5. Publier

Quand tout fonctionne, publie le conteneur (version "v2 — e-commerce events").

## Livrable attendu

- Une capture de DebugView montrant un `purchase` complet (avec `transaction_id`, `value`, et la liste des `items`)

## Critères de validation

- [ ] 6 tags GA4 Event créés (un par événement e-commerce)
- [ ] Chaque tag a son déclencheur Custom Event correspondant
- [ ] Les variables Data Layer renvoient bien les bonnes valeurs (vérifié en Aperçu GTM)
- [ ] DebugView GA4 affiche les 6 événements avec leurs paramètres après un parcours complet
- [ ] Conteneur publié en version "v2 — e-commerce events"

## Pièges classiques

- **Confondre `event name` au sens GTM (déclencheur Custom Event) et `event name` envoyé à GA4** (champ "Event Name" du tag) : les deux sont indépendants. La best practice est de les garder identiques.
- **Oublier d'envoyer le tableau `items` complet** : sans `items`, GA4 ne peut pas calculer le revenu par produit ni le funnel.
- **Mode Aperçu non rafraîchi** : si tu modifies un tag, sors et rentre en aperçu (sinon tu testes l'ancienne version).
- **Variable Data Layer mal nommée** : `ecommerce.items` ≠ `ecommerce_items`. Respecte le path exact tel qu'il est poussé.

## Ressources

- [GA4 — Schéma e-commerce recommandé](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
- [GTM — Variables Data Layer](https://support.google.com/tagmanager/answer/9080510)
- [GTM — Custom Event Trigger](https://support.google.com/tagmanager/answer/7679219)
