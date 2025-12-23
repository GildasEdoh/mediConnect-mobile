# mediConnect — Mobile

Ce dossier contient l'application mobile construite avec Expo (expo-router). Ce README décrit comment installer, configurer et exécuter l'application mobile.

## Aperçu

- Framework : Expo (avec expo-router)
- React / React Native : React 19.x / React Native 0.81.x
- Gestion de la BD : Supabase (client `@supabase/supabase-js` v2)
- Emplacement : `mobile/`

## Prérequis

- Node.js 18+ recommandé
- pnpm (recommandé, repo principal contient `pnpm-lock.yaml`) ou npm
- Expo CLI (optionnel si vous utilisez `npx expo`)
- Xcode / Android Studio si vous voulez exécuter sur simulateur/device natif

## Variables d'environnement

Créez un fichier `.env` à la racine du dossier `mobile/` (un `.env` existe déjà dans le dossier, vérifiez son contenu). Les variables minimales attendues :

- SUPABASE_URL
- SUPABASE_ANON_KEY

Par exemple (`mobile/.env` ou `mobile/.env.local`):

```
SUPABASE_URL=https://xyzcompany.supabase.co
SUPABASE_ANON_KEY=eyJ... (clé publique)
```

Note : ne commitez jamais vos clés privées. Utilisez des secrets CI ou des environnements sécurisés pour les builds.

## Installation

Dans le dossier `mobile/` :

```bash
cd mobile
pnpm install      # ou: npm install
```

## Scripts utiles (depuis `mobile/`)

Les scripts disponibles dans `mobile/package.json` :

- `dev` — démarre Expo (dev server / Metro) : `EXPO_NO_TELEMETRY=1 expo start`
- `build:web` — export web (`expo export --platform web`)
- `lint` — `expo lint`
- `typecheck` — `tsc --noEmit`

Exemples :

```bash
pnpm dev          # lance expo start
pnpm build:web    # build pour le web
pnpm lint         # lance le linter
pnpm typecheck    # vérifie les types TS
```

Vous pouvez aussi utiliser `npx expo start` si vous n'avez pas Expo CLI installé globalement.

## Supabase / Migrations

Les migrations SQL sont présentes dans :

```
mobile/supabase/migrations/
```

Fichiers trouvés :
- `20251223142237_create_mediconnect_schema.sql` — création du schéma
- `20251223142728_add_sample_data.sql` — ajout de données d'exemple

Pour initialiser une base Supabase locale ou distante, appliquez ces migrations via l'outil de votre choix (psql, supabase CLI, ou via l'interface Supabase). Exemple rapide avec psql :

```bash
psql -h <host> -U <user> -d <db> -f mobile/supabase/migrations/20251223142237_create_mediconnect_schema.sql
psql -h <host> -U <user> -d <db> -f mobile/supabase/migrations/20251223142728_add_sample_data.sql
```

## Points d'attention / Debug

- Le projet utilise `expo-router` (voir `package.json` : `main: "expo-router/entry"`). Les routes se trouvent dans `mobile/app/`.
- Si vous rencontrez des erreurs liées à `react-native-reanimated`, suivez la doc d'installation de `react-native-reanimated` (rebuild natif si nécessaire).
- Sur macOS, pour tester sur iOS Simulator, lancez : `pnpm dev` puis appuyez sur `i` dans la console Expo pour ouvrir le simulateur.
- Pour Android : appuyez sur `a` ou ouvrez un émulateur Android via Android Studio.

## Tests & Type-check

- Type checking :

```bash
pnpm typecheck
```

- Lint :

```bash
pnpm lint
```

## Contribution

- Ouvrez une branche dédiée par feature/bugfix.
- Ajoutez des migrations SQL dans `mobile/supabase/migrations` si vous modifiez le schéma.
- Documentez les modifications importantes dans ce README si elles affectent l'installation ou la configuration.

## Déploiement

- Pour publier sur le web : `pnpm build:web` (Expo web)
- Pour publier sur stores natifs, utilisez EAS Build (Expo Application Services) ; configurez vos credentials et suivez la doc Expo EAS.

## Fichiers importants

- `mobile/app/` — routes et écrans (expo-router)
- `mobile/lib/supabase.ts` — initialisation du client Supabase
- `mobile/supabase/migrations/` — migrations SQL
- `mobile/package.json`, `mobile/app.json` — configurations et scripts

---

Besoin d'un `.env.example` généré automatiquement ou d'ajouter des badges/CI (GitHub Actions / EAS) ? Je peux créer ces fichiers et configurer un exemple de workflow CI si vous le souhaitez.