# Étape 1 — Audit SEO du site Stellaire

## Objectif

Auditer le site Stellaire (lien fourni par Adrien) sur trois axes — **technique**, **ergonomique**, **éditorial** — et produire un rapport structuré avec recommandations priorisées.

## Pré-requis

- Le lien Vercel du site déployé (Adrien te le fournit)
- Chrome avec Lighthouse (intégré aux DevTools)
- Optionnel : Screaming Frog SEO Spider (version gratuite, jusqu'à 500 URLs)
- Optionnel : Google Search Console (peut nécessiter de vérifier la propriété, voir étape 2)

## Marche à suivre

### 1. Découverte du site (15-20 min)

Parcours le site comme un visiteur lambda : home, catalogue, fiche produit, panier, checkout, blog, contact. Note tes premières impressions. Ce que tu **ressens** mal, un visiteur le ressentira aussi.

### 2. Audit technique (45-60 min)

Outils recommandés :
- **Lighthouse** (Chrome DevTools → Lighthouse → Generate report) : lance un audit sur la home, le catalogue, une fiche produit. Note les scores et les principales recommandations.
- **DevTools → Elements** : inspecte les `<head>` de chaque page (title, meta description, balises Hn, attribut lang, images sans alt).
- **DevTools → Network** : repère les ressources lourdes (images > 500ko).
- **`/robots.txt`** et **`/sitemap.xml`** : ouvre-les directement dans le navigateur. Cherche les incohérences.
- **Validateur Schema.org** : https://validator.schema.org/ — colle l'URL d'une fiche produit, vérifie le JSON-LD.
- Optionnel : **Screaming Frog** pour cartographier les URL, les balises, les liens internes/externes, les 404.

Pour chaque problème, note : page concernée, élément précis, ce qui ne va pas, ce qui devrait être fait.

### 3. Audit ergonomique (30-45 min)

Outils :
- **Lighthouse → Accessibility** : score + détails.
- **Navigation mobile** : Chrome DevTools → bascule mobile (Ctrl+Shift+M). Teste le parcours sur 360px de large.
- **Contraste** : DevTools → Inspect Element sur les boutons/CTA → onglet "Accessibility" → Contrast Ratio.
- **Test "à la souris fermée"** : essaie de soumettre un formulaire vide, supprime un produit du panier, valide une commande. Tout est-il clair ? Y a-t-il un feedback ?

### 4. Audit éditorial (30-45 min)

À l'œil et au cerveau :
- Les titres SEO sont-ils optimisés (mot-clé en début, pas trop longs, uniques) ?
- Les meta descriptions donnent-elles envie de cliquer ? Sont-elles uniques ?
- Le maillage interne est-il bon ? (le blog renvoie-t-il vers le catalogue ? les fiches produits vers des contenus connexes ?)
- Y a-t-il de la cannibalisation de mots-clés entre les pages ?
- Les anchor texts sont-ils descriptifs ou génériques ?
- Le contenu des fiches produits est-il suffisant et différencié ?

## Livrable attendu

Un rapport Markdown structuré comme suit (à rendre dans un fichier `audit-stellaire.md` que tu m'envoies) :

```markdown
# Audit SEO du site Stellaire — [ton nom] — [date]

## Synthèse exécutive
3-5 lignes : état général, principaux constats, axes prioritaires.

## 1. Axe technique
Pour chaque issue :
### Issue T1 — [titre court]
- **Page(s)** : URL(s)
- **Élément** : sélecteur ou description précise
- **Constat** : ce qui ne va pas
- **Impact estimé** : élevé / moyen / faible (+ pourquoi)
- **Recommandation** : action concrète à entreprendre
- **Priorité** : P1 (à corriger immédiatement) / P2 / P3

## 2. Axe ergonomique
Même format.

## 3. Axe éditorial
Même format.

## Plan d'action priorisé
Tableau récapitulatif : top 10 actions à mener, dans l'ordre.
```

## Critères de validation

- [ ] Au moins 12 issues identifiées au total (l'objectif est d'en trouver 15+)
- [ ] Chaque issue a sa localisation précise (URL + élément)
- [ ] Chaque issue a une recommandation actionnable
- [ ] Le rapport propose une priorisation justifiée
- [ ] Le rapport mentionne les outils utilisés pour chaque type d'issue

## Pièges classiques

- **Confondre score Lighthouse et priorité métier** : un score de 60 en SEO n'est pas forcément urgent si les pages clés sont OK.
- **Oublier le "pourquoi"** : recommander "ajouter une meta description" ne suffit pas — il faut expliquer l'impact (taux de clic SERP, lisibilité).
- **Ne regarder que les pages templates** : pense à auditer des pages "individuelles" (un produit en particulier, un article spécifique).
- **Négliger la dimension ergonomique** : un site rapide et bien balisé qui frustre les utilisateurs ne convertira pas.

## Ressources

- [Documentation Google : SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [Lighthouse — comprendre les métriques](https://developer.chrome.com/docs/lighthouse/)
- [Schema.org Validator](https://validator.schema.org/)
- [Google Search Central — robots.txt](https://developers.google.com/search/docs/crawling-indexing/robots/intro)
