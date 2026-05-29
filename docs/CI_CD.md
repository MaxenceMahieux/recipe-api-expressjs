# CI/CD — Recipe API

Pipeline d'intégration continue sur **GitHub Actions**. Objectif : **aucun code non conforme ne rejoint `master`**. Toute barrière rouge bloque la fusion, sans exception.

> Périmètre : intégration continue (CI) uniquement. Le déploiement (CD) est hors périmètre tant qu'il n'y a pas de cible d'hébergement.

---

## 1. Principes

- **Tout passe par une Pull Request.** Aucun push direct sur `master`.
- **Pipeline bloquant.** Une PR ne peut être fusionnée que si **toutes** les barrières sont vertes.
- **Fail-fast.** Chaque barrière échoue dès la première violation, sans tolérance ni avertissement « non bloquant ».
- **Reproductible.** Mêmes commandes en local et en CI ; installation déterministe via `npm ci`.

## 2. Déclencheurs

| Événement | Cible | Effet |
|-----------|-------|-------|
| `pull_request` | vers `master` | Exécute toutes les barrières (obligatoire avant fusion) |
| `push` | sur `master` | Re-vérifie après fusion |

## 3. Vue d'ensemble du pipeline

Quatre jobs **indépendants et parallèles**, tous requis. Étape commune en tête de chaque job : `actions/checkout` puis `actions/setup-node` (cache npm) puis `npm ci`.

| Job | Barrière | Commande | Condition d'échec |
|-----|----------|----------|-------------------|
| `lint` | Lint / format | `npm run lint` + `npm run format:check` | Toute erreur ESLint ou fichier non formaté |
| `test` | Tests + couverture | `npm test` | Test rouge **ou** couverture < 100 % |
| `commit` | Convention de commits | `commitlint` sur les commits de la PR | Message non conforme au format `<emoji> \| <Description>` |
| `audit` | Dépendances | `npm audit --audit-level=high` | Vulnérabilité de niveau ≥ high |

## 4. Barrières (gates)

### 4.1 Lint / format — job `lint`

- **Outils** : ESLint (qualité) + Prettier (formatage).
- **Commandes** : `npm run lint` (zéro warning toléré, `--max-warnings 0`) et `npm run format:check`.
- **Règle stricte** : aucun warning admis ; le formatage est vérifié, pas corrigé, en CI.

### 4.2 Tests + couverture — job `test`

- **Outil** : Jest (`npm test` lance déjà `jest --verbose --coverage`).
- **Seuil bloquant** : couverture **100 %** (branches, fonctions, lignes, instructions), imposé par `jest.coverageThreshold` dans `package.json`. Voir [PLAN_DE_TEST.md](./PLAN_DE_TEST.md).
- **Règle stricte** : un seul test rouge ou 1 ligne non couverte fait échouer le job.

### 4.3 Convention de commits — job `commit`

- **Outil** : commitlint, validé sur **tous les commits de la PR** (`commitlint --from <base> --to <head>`).
- **Règle** : format imposé par le README — `<emoji> | <Description à l'impératif>`. Le séparateur ` | ` étant spécifique au projet, une **règle personnalisée** (regex) est nécessaire ; les configurations gitmoji standard ne suffisent pas.
- **Règle stricte** : un seul commit non conforme bloque la PR.

### 4.4 Audit des dépendances — job `audit`

- **Commande** : `npm audit --audit-level=high`.
- **Règle stricte** : toute vulnérabilité de niveau **high** ou **critical** bloque ; les niveaux inférieurs sont signalés mais non bloquants pour éviter le bruit inutile.

## 5. Protection de branche `master`

Réglages à activer dans GitHub (Settings → Branches → Branch protection rule sur `master`) :

- **Require a pull request before merging** (interdit le push direct).
- **Require status checks to pass** : cocher `lint`, `test`, `commit`, `audit`.
- **Require branches to be up to date before merging** (rebase/merge à jour obligatoire).
- **Require linear history** (pas de merge commit parasite).
- **Do not allow bypassing** (les règles s'appliquent aussi aux administrateurs).

## 6. Critères de validation

- **Succès** : les 4 jobs verts → fusion autorisée.
- **Échec** : un seul job rouge → fusion bloquée ; correction en local puis nouveau push sur la branche de la PR.

## 7. Prérequis d'outillage

Le pipeline décrit ci-dessus suppose les ajouts suivants au projet (non encore présents) :

| Barrière | À installer / configurer |
|----------|--------------------------|
| Lint / format | `eslint`, `prettier` + scripts `lint`, `format:check` dans `package.json` ; fichiers `.eslintrc`, `.prettierrc` |
| Couverture | `jest.coverageThreshold` à 100 % dans `package.json` |
| Commits | `@commitlint/cli` + règle personnalisée pour le format `<emoji> \| <Description>` |
| Audit | aucun (npm intégré) |

## 8. Modèle de workflow (référence)

Squelette à recopier dans `.github/workflows/ci.yml` lorsque l'outillage du §7 sera en place.

```yaml
name: CI
on:
  pull_request:
    branches: [master]
  push:
    branches: [master]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run format:check

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm test

  commit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npx commitlint --from origin/master --to HEAD

  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm audit --audit-level=high
```
