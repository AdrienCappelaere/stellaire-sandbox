# Étape 6 — CMP Axeptio + Consent Mode v2

## Objectif

Mettre en place un bandeau de consentement cookies fonctionnel via Axeptio, configurer le Consent Mode v2 de Google (default denied → update au consentement), et vérifier que les tags GTM respectent l'état du consent.

## Pré-requis

- Étape 5 terminée
- Un projet Axeptio créé (offre gratuite suffisante)

## Marche à suivre

### 1. Créer ton projet Axeptio

1. Va sur https://www.axeptio.eu/ et crée un compte (gratuit).
2. Crée un nouveau projet "Stellaire".
3. Crée une **Version de cookies** : nom interne `stellaire-base`. Configure les catégories :
   - **Mesure d'audience** (lié à `analytics_storage`)
   - **Publicité** (lié à `ad_storage`, `ad_user_data`, `ad_personalization`) — même si on n'en a pas, prévois-la
4. Récupère ton **clientId** dans les paramètres du projet (format UUID).

### 2. Brancher Axeptio sur le site

1. Sur GitHub, ouvre `site/assets/js/integrations.js`, clique sur le crayon.
2. Trouve la ligne `clientId: "YOUR-CLIENT-ID"`. Remplace par ton vrai clientId.
3. Confirme que `cookiesVersion: "stellaire-base"` correspond bien au nom de version cookies que tu as créé dans Axeptio.
4. Commit.

### 3. Activer le Consent Mode v2 par défaut (denied)

Dans le même fichier `integrations.js`, **avant le bloc GTM**, il y a un bloc commenté (BLOC 0) qui ressemble à :

```javascript
// window.gtag = window.gtag || function(){ ... };
// gtag('consent', 'default', { ... });
```

**Décommente l'intégralité du BLOC 0**. Cela définit le consent par défaut à `denied`. Tant que le visiteur n'a pas cliqué sur "Accepter" dans Axeptio, Google sait qu'il n'a pas le droit de stocker de cookies analytics ou pub.

Commit.

### 4. Configurer Axeptio pour appeler `gtag consent update`

Dans le back-office Axeptio :
1. Va dans **Intégrations** → **Google Consent Mode v2**.
2. Active l'intégration.
3. Axeptio se charge d'appeler `gtag('consent', 'update', { ... })` quand l'utilisateur consent. Vérifie dans la doc Axeptio s'il faut renseigner un script complémentaire ; sinon, le SDK Axeptio le fait tout seul.

### 5. Vérifier

1. Ouvre une fenêtre **navigation privée** (sinon Axeptio se souvient de ton consent précédent).
2. Charge le site Stellaire. Le bandeau Axeptio doit apparaître.
3. Avec Tag Assistant ouvert : avant que tu cliques "Accepter", le tag GA4 ne doit **pas** se déclencher (ou se déclencher en mode `consent denied` — visible dans Tag Assistant).
4. Clique "Accepter" dans Axeptio. Le tag GA4 doit alors se déclencher normalement.
5. Refais le test en cliquant "Refuser" : aucun cookie analytics ne doit être déposé (vérifie dans DevTools → Application → Cookies).

### 6. Compléter la page politique cookies

La page `site/politique-cookies.html` est vide. Édite-la sur GitHub pour y mettre un contenu rédigé qui explique : quelles catégories de cookies sont utilisées, à quoi elles servent, comment l'utilisateur peut modifier son choix (lien vers le widget Axeptio).

### 7. Publier

Publie le conteneur GTM (version "v4 — consent mode").

## Livrable attendu

- Captures montrant :
  - Bandeau Axeptio affiché en première visite
  - Tag GA4 bloqué (consent denied) avant clic "Accepter"
  - Tag GA4 actif après clic "Accepter"
  - Page politique cookies remplie

## Critères de validation

- [ ] Projet Axeptio créé, clientId branché dans `integrations.js`
- [ ] Bloc Consent Mode v2 par défaut (denied) activé dans `integrations.js`
- [ ] Bandeau Axeptio visible en navigation privée
- [ ] Vérification que les tags respectent le consent (avant/après "Accepter")
- [ ] Page politique cookies remplie avec un contenu rédigé

## Pièges classiques

- **Tester avec un consent déjà donné** : utilise toujours la navigation privée pour réinitialiser.
- **Oublier la `cookiesVersion`** : si elle ne correspond pas à celle du back-office Axeptio, le bandeau ne s'affiche pas.
- **Configurer le consent mode APRÈS le tag GTM** : l'ordre est critique. Le `gtag('consent', 'default', ...)` doit être exécuté AVANT le snippet GTM. Notre `integrations.js` respecte cet ordre — ne change pas la position des blocs.
- **Confondre `analytics_storage` et `ad_storage`** : `analytics_storage` contrôle GA4. `ad_storage` contrôle Google Ads.

## Ressources

- [Axeptio — documentation](https://developers.axeptio.eu/v/francais)
- [Google Consent Mode v2 — overview](https://developers.google.com/tag-platform/security/guides/consent)
- [GTM — Consent settings](https://support.google.com/tagmanager/answer/10718549)
