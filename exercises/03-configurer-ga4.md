# Étape 3 — Configurer GA4 via GTM

## Objectif

Créer une propriété GA4, créer dans GTM le tag de configuration GA4 qui va l'alimenter, et vérifier en temps réel que les hits remontent.

## Pré-requis

- Étape 2 terminée (GTM branché sur le site)

## Marche à suivre

### 1. Créer une propriété GA4

1. Va sur https://analytics.google.com/.
2. Crée un compte si besoin, puis une **propriété** GA4 "Stellaire — Training". Devise : EUR. Fuseau : Europe/Paris.
3. À la création, GA4 te propose un **flux de données Web** : indique l'URL Vercel du site Stellaire.
4. Récupère ton **Measurement ID** (format `G-XXXXXXXXXX`). Note-le.

### 2. Créer le tag de configuration GA4 dans GTM

1. Va sur GTM, ouvre ton conteneur Stellaire.
2. Onglet **Balises** → **Nouvelle**.
3. Type : **Google Tag** (anciennement "GA4 Configuration" — la fusion des deux a eu lieu en 2024). Renseigne :
   - **Tag ID** : ton `G-XXXXXXXXXX`
4. Déclencheur : **All Pages**.
5. Nom de la balise : "GA4 — Configuration".
6. Enregistre.

### 3. Tester avant publication

1. Clique **"Aperçu"** en haut à droite, saisis l'URL Stellaire, lance la session de debug.
2. Sur le site, parcours quelques pages.
3. Dans Tag Assistant, vérifie que la balise "GA4 — Configuration" se déclenche bien sur chaque page.
4. Va sur GA4 → **Configurer** → **DebugView**. Tu dois voir des événements `page_view` arriver en temps réel.

### 4. Publier le conteneur

1. Dans GTM, clique **"Envoyer"** (en haut à droite).
2. Nom de version : "v1 — GA4 config". Description : "Configuration de base GA4".
3. Publie.

## Livrable attendu

- Measurement ID GA4 communiqué à Adrien
- Capture de GA4 DebugView montrant des `page_view` en temps réel sur le site Stellaire

## Critères de validation

- [ ] Propriété GA4 créée, flux Web associé à l'URL Stellaire
- [ ] Tag "GA4 — Configuration" créé dans GTM, déclencheur "All Pages"
- [ ] Aperçu GTM montre la balise déclenchée à chaque navigation
- [ ] DebugView GA4 montre `page_view` en temps réel
- [ ] Version GTM publiée (visible dans l'historique des versions)

## Pièges classiques

- **Oublier de cliquer "Envoyer"** : tant que tu n'as pas publié, le tag n'est actif qu'en preview pour toi. La candidate doit publier pour que les hits remontent depuis n'importe quel visiteur.
- **Confondre Measurement ID (G-XXX) et GTM-ID (GTM-XXX)** : le premier va dans le tag GA4 ; le second est déjà dans `integrations.js`.
- **DebugView vide** : il faut être en mode debug (aperçu GTM ou extension GA Debugger active). Sans ça, tes événements vont dans le rapport "Realtime" mais pas dans "DebugView".

## Ressources

- [Configurer une propriété GA4](https://support.google.com/analytics/answer/9304153)
- [Le tag GA4 dans GTM](https://support.google.com/tagmanager/answer/9442095)
- [GA4 DebugView](https://support.google.com/analytics/answer/7201382)
