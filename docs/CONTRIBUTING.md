# Guide de contribution — Recipe API

Point d'entrée unique pour contribuer proprement : branches, commits, tests et cycle de Pull Request. Les règles sont **strictes** et appliquées par la CI (voir [CI_CD.md](./CI_CD.md)).

---

## 1. Prérequis

```bash
npm ci        # installation déterministe (respecte package-lock.json)
npm test      # vérifie que tout passe avant de commencer
```

## 2. Cycle de contribution

1. Créer une **branche** depuis `master` à jour.
2. Développer **un seul sujet** par branche.
3. Écrire/mettre à jour les **tests** (couverture 100 % maintenue).
4. **Commiter** selon la convention Gitmoji.
5. Ouvrir une **Pull Request** vers `master`.
6. Attendre que **toutes les barrières CI** soient vertes.
7. **Fusionner** uniquement après revue + CI verte (historique linéaire).

Aucun push direct sur `master` : tout passe par une PR.

## 3. Nommage des branches

Format : `<type>/<description-en-kebab-case>`

| Type | Usage |
|------|-------|
| `feat` | Nouvelle fonctionnalité |
| `fix` | Correction de bug |
| `test` | Ajout/mise à jour de tests |
| `refactor` | Refactorisation sans changement de comportement |
| `docs` | Documentation |
| `chore` | Configuration, outillage, maintenance |

Exemples : `feat/filtre-par-categorie`, `fix/moyenne-des-notes`, `test/calcul-nutrition`.

## 4. Commits

Convention **Gitmoji** au format `<emoji> | <Description à l'impératif>`. Règles complètes et tableau des emojis dans le [README](../README.md#convention-de-commits).

- Un commit = un changement cohérent.
- Description en français, à l'impératif, majuscule initiale, sans point final.

## 5. Tests et couverture

- Tout code ajouté ou modifié doit être couvert par des tests **unitaires**.
- Objectif **100 %** (branches, fonctions, lignes, instructions).
- Stratégie et cas de test : [PLAN_DE_TEST.md](./PLAN_DE_TEST.md).

```bash
npm test      # Jest avec couverture
```

## 6. Pull Requests

- Cible : `master`. Titre au format de commit (`<emoji> | <Description>`).
- Décrire **le quoi et le pourquoi** ; lier l'issue concernée le cas échéant.
- La PR doit être **à jour** avec `master` avant fusion.
- Les 4 barrières CI (`lint`, `test`, `commit`, `audit`) doivent être vertes — détails dans [CI_CD.md](./CI_CD.md).

## 7. Checklist avant de pousser

- [ ] La branche suit `<type>/<description>`.
- [ ] `npm test` passe en local, couverture à 100 %.
- [ ] Les messages de commit respectent `<emoji> | <Description>`.
- [ ] La documentation impactée est à jour.
- [ ] La branche est rebasée sur `master` à jour.
