# Étape 7 — Vérification bout-en-bout

## Objectif

Faire le tour de toute l'implémentation, croiser les sources de vérification (Tag Assistant, GA4 DebugView, GA4 Realtime, DevTools, Axeptio), et documenter ce qui passe et ce qui ne passe pas.

## Pré-requis

- Étapes 1 à 6 terminées

## Marche à suivre

### 1. Préparer un parcours utilisateur "golden path"

Tu vas exécuter ce parcours en navigation privée :

1. Charger la home
2. Refuser le consentement Axeptio → vérifier que GA4 ne reçoit RIEN
3. Effacer les cookies (fermer/rouvrir nav privée)
4. Recharger la home, **accepter** Axeptio
5. Naviguer : home → catalogue (filtrer "Télescopes") → fiche produit Dobson 200mm → ajout au panier → panier → checkout → soumission → confirmation
6. Retourner sur le site, soumettre le formulaire contact
7. Soumettre le formulaire newsletter en footer

### 2. Liste de contrôle des événements attendus dans GA4 DebugView

À chaque étape du parcours, vérifie que l'événement attendu remonte :

| Étape user | Événement GA4 attendu | Paramètres clés |
|---|---|---|
| Charge home | `page_view` | `page_location` = home URL |
| Charge fiche produit | `page_view` + `view_item` | `items[0].item_name` = "Dobson 200mm" |
| Click "Voir nos coups de cœur" | `coup_de_coeur_click` ou `deep_scroll` (selon ton choix étape 5) | — |
| Click "Ajouter au panier" | `add_to_cart` | `value`, `items[0]` |
| Charge panier | `view_cart` | `value` = total panier |
| Click "Passer commande" | `begin_checkout` | `value`, `items` |
| Soumet checkout | `page_view` (confirmation) + `purchase` | `transaction_id`, `value`, `items` |
| Soumet contact | `generate_lead` | `form_id` = "contact" |
| Soumet newsletter | `sign_up` | `method` = "newsletter" |

### 3. Croisement multi-sources

Pour chaque événement, vérifie sur 2 sources :
- **Tag Assistant** : la balise GTM s'est déclenchée, avec les bons paramètres
- **GA4 DebugView** : l'événement est arrivé sur Google, avec les bons paramètres
- Bonus : **GA4 Realtime** (sans mode debug) montre aussi les événements en quasi temps-réel

### 4. Documenter

Produis un fichier `verification-stellaire.md` avec :

```markdown
# Vérification du tracking — Stellaire

## Configuration testée
- GTM-ID : ...
- GA4 Measurement ID : ...
- Axeptio clientId : ...
- Version conteneur GTM : v4
- Date du test : ...

## Résultats par événement

| Événement | Tag Assistant | DebugView | Realtime | Paramètres OK | Notes |
|---|---|---|---|---|---|
| page_view (home) | ✅ | ✅ | ✅ | ✅ | — |
| view_item | ✅ | ✅ | ✅ | ✅ | — |
| ... | ... | ... | ... | ... | ... |

## Issues identifiées
- [Si tu trouves un événement qui ne remonte pas correctement, décris ici]

## Comportement consent
- [ ] Tags bloqués avant consent (consent denied)
- [ ] Tags actifs après consent
- [ ] Aucun cookie analytics avant consent
```

## Livrable attendu

Le fichier `verification-stellaire.md` complété et envoyé à Adrien.

## Critères de validation

- [ ] Tous les événements attendus (tableau ci-dessus) ont été testés
- [ ] Pour chaque événement, deux sources de vérification au minimum
- [ ] Le comportement consent (denied → update) est vérifié
- [ ] Toute issue est documentée avec sa cause probable

## Pièges classiques

- **Cookies persistants** : la même session de test peut donner un résultat différent quelques minutes plus tard si le consent change. Toujours utiliser la navigation privée pour des tests propres.
- **DebugView ne montre rien** : il faut être en mode debug actif (preview GTM ou extension GA Debugger). Sinon, les hits vont dans Realtime mais pas DebugView.
- **Confondre Realtime et Reports standards** : les rapports standards GA4 ont 24-48h de latence. Ne les utilise pas pour vérifier que ton implémentation marche le jour J.

## Ressources

- [GA4 DebugView documentation](https://support.google.com/analytics/answer/7201382)
- [Tag Assistant — déboguer GTM](https://support.google.com/tagassistant)
