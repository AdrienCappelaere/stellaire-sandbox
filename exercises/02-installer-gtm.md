# Étape 2 — Installer GTM sur le site Stellaire

## Objectif

Créer un conteneur Google Tag Manager (Web), récupérer son ID, et le brancher au site Stellaire en éditant **un seul fichier** via l'interface GitHub. Vérifier que GTM charge bien sur toutes les pages.

## Pré-requis

- Étape 1 (audit) terminée
- Un compte Google personnel
- Accès au repo GitHub Stellaire (Adrien t'a partagé le lien)

## Marche à suivre — pas à pas

### 1. Créer un compte et un conteneur GTM

1. Va sur https://tagmanager.google.com/ et connecte-toi.
2. Clique "**Créer un compte**".
3. Nom du compte : "Stellaire — Training" (ou ce que tu veux). Pays : France.
4. Nom du conteneur : "Stellaire Web". Plateforme cible : **Web**.
5. Accepte les conditions. Tu arrives sur l'écran d'accueil du conteneur — Google affiche **deux snippets** de code et un identifiant qui ressemble à `GTM-XXXXXXX`.
6. **Note ton GTM-ID** quelque part — on s'en sert juste après.
7. Tu peux fermer la fenêtre des snippets : on ne va PAS copier-coller leur contenu, on a déjà le code prêt sur le site.

### 2. Brancher l'ID sur le site

C'est ici qu'on remplace le snippet "à coller dans le `<head>`" par une seule modification d'un fichier.

1. Va sur le repo GitHub du site (Adrien t'a partagé l'URL).
2. Ouvre le fichier **`site/assets/js/integrations.js`**.
3. Clique sur l'icône **crayon** ("Edit this file") en haut à droite.
4. Cherche la ligne qui contient `'GTM-XXXXXXX'`. Elle apparaît **deux fois** : remplace les **deux** occurrences par ton vrai GTM-ID (ex : `'GTM-AB1C2D3'`).
5. Scrolle en bas de la page, clique **"Commit changes..."**, puis **"Commit changes"** dans la modale.
6. Attends ~30 secondes : Vercel redéploie automatiquement.

### 3. Vérifier que GTM charge

1. Retourne sur ton conteneur GTM.
2. Clique sur **"Aperçu"** (en haut à droite). Saisis l'URL du site Stellaire (ex : `https://stellaire-xxx.vercel.app`). Clique "Connect".
3. Une nouvelle fenêtre s'ouvre avec ton site, et **Tag Assistant** s'affiche dans une autre fenêtre. Tu dois voir "Connected!".
4. Dans Tag Assistant, tu dois voir l'événement **"Container Loaded"**. C'est gagné.
5. Bonus : installe l'extension Chrome **Tag Assistant Companion** pour mieux voir ce qui se passe sur le site.

## Livrable attendu

- Ton GTM-ID communiqué à Adrien
- Une capture d'écran de Tag Assistant montrant "Container Loaded" sur la home Stellaire

## Critères de validation

- [ ] GTM-ID au format `GTM-XXXXXXX` créé
- [ ] `integrations.js` modifié sur GitHub (ton ID y figure aux deux endroits)
- [ ] Vercel a redéployé (l'historique des déploiements le confirme)
- [ ] Tag Assistant affiche "Container Loaded" sur la home, le catalogue ET une fiche produit
- [ ] La balise `<script src="https://www.googletagmanager.com/gtm.js?id=...">` est présente dans le HTML chargé (DevTools → Network → filter "gtm")

## Pièges classiques

- **Oublier de remplacer les deux occurrences** dans `integrations.js` (il y en a une dans le code IIFE, une dans le guard). Vérifie qu'aucun `GTM-XXXXXXX` ne traîne après ton commit.
- **Tester sans attendre Vercel** : le déploiement met ~30s. Va voir l'onglet "Deployments" du repo (sur Vercel) pour confirmer que le nouveau déploiement est "Ready".
- **Bloqué par un bloqueur de pub** : les extensions type uBlock peuvent bloquer GTM. Désactive-les sur l'URL Stellaire pour tester.
- **Snippet noscript non posé** : avec notre approche JS-only, le `<noscript>` du snippet GTM n'est pas en place. C'est volontaire et acceptable pour ce projet — on en reparlera en débrief.

## Ressources

- [GTM — Quickstart Guide](https://developers.google.com/tag-platform/tag-manager/web)
- [Comprendre `dataLayer`](https://developers.google.com/tag-platform/tag-manager/datalayer)
- [Tag Assistant — Mode d'emploi](https://support.google.com/tagassistant/answer/10039345)
