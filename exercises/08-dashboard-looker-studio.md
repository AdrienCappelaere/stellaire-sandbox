# Étape 8 — Construire le dashboard Looker Studio

## Objectif

Construire dans Looker Studio (ex-Data Studio) un dashboard **une page** qui restitue l'essentiel de l'activité du site Stellaire : acquisition, conversion, produits, funnel.

## Pré-requis

- Étapes 1 à 7 terminées
- Idéalement : 24h-48h après le tracking pour avoir un peu de données. Sinon, force des données en faisant toi-même un parcours complet plusieurs fois.

## Marche à suivre

### 1. Créer le rapport

1. Va sur https://lookerstudio.google.com/.
2. Nouveau rapport vierge.
3. Ajoute une source de données → **Google Analytics** → sélectionne la propriété Stellaire que tu as créée.

### 2. Structurer la page

Découpe la page en 4 zones :

```
+--------------------------------------------------+
| EN-TÊTE : Logo + titre + période                 |
+--------------------------------------------------+
| KPI cards : Sessions | Utilisateurs |             |
|             Taux de conv. | Revenue total        |
+--------------------------------------------------+
| Acquisition (gauche)    | Funnel achat (droite)  |
| - Sessions/source       | view_item → add_to_cart|
| - Bar chart             | → begin_checkout       |
|                         | → purchase             |
+-------------------------+-------------------------+
| Top produits (bas)                                |
| Tableau : item_name | quantité | revenue        |
+--------------------------------------------------+
```

### 3. KPI cards (4)

Pour chacune : composant "Scorecard".

- **Sessions** : métrique `Sessions`
- **Utilisateurs actifs** : métrique `Active users`
- **Taux de conversion (achats)** : métrique `Purchaser conversion rate` (ou calculée : `purchase / sessions`)
- **Revenue total** : métrique `Total revenue`

### 4. Acquisition

Composant "Bar chart" :
- Dimension : `Session source / medium`
- Métrique : `Sessions`
- Tri : `Sessions` descendant, top 10

### 5. Funnel d'achat

Looker Studio n'a pas de "funnel" natif simple. Deux approches :
- **Tableau** avec dimension `Event name` filtrée sur `view_item, add_to_cart, begin_checkout, purchase`, métrique `Event count`. Tri manuel des lignes dans l'ordre du funnel.
- **Bar chart horizontale** triée dans le même ordre.

Choisis ce qui rend le mieux.

### 6. Top produits

Composant "Tableau" :
- Dimension : `Item name`
- Métriques : `Items purchased`, `Item revenue`
- Tri : `Item revenue` descendant, top 5

### 7. Période et filtres

- Ajoute un **contrôle de plage de dates** en haut → permet à l'utilisateur de changer la période.
- Période par défaut : **7 derniers jours**.

### 8. Mise en forme

- Charte cosmique : fond sombre (#0F172A), titres clairs, accents indigo
- Logo Stellaire en en-tête
- Titres clairs sur chaque bloc

### 9. Partager

Bouton "Partager" → "Obtenir un lien de visualisation" → réglage "Toute personne disposant du lien peut consulter".

## Livrable attendu

- L'URL publique du dashboard Looker Studio, envoyée à Adrien
- Un commentaire (un paragraphe) qui explique : pour qui ce dashboard est conçu, quelles décisions il permet de prendre

## Critères de validation

- [ ] Dashboard tient sur une seule page
- [ ] 4 KPI cards en haut
- [ ] Vue acquisition (bar chart sources)
- [ ] Vue funnel (4 étapes : view_item → add_to_cart → begin_checkout → purchase)
- [ ] Top 5 produits par revenue
- [ ] Sélecteur de période
- [ ] Cohérence visuelle (cosmic palette)

## Pièges classiques

- **Mauvaise dimension "Source"** : `Session source/medium` vs `First user source/medium` — ne dit pas la même chose.
- **Périodes incohérentes** : si tu compares la semaine vs la veille, normalise les périodes.
- **Trop de tout** : sur 1 page, on ne peut pas tout dire. Si une métrique n'aide pas à prendre une décision, on l'enlève.
- **Filtres globaux qui cassent une vue** : un filtre "purchase only" appliqué globalement empêche le funnel de montrer les autres étapes.

## Ressources

- [Looker Studio — connecteur GA4](https://support.google.com/looker-studio/answer/6283323)
- [GA4 — Dimensions et métriques disponibles](https://support.google.com/analytics/answer/9143382)
