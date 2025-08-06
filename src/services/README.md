# Services Architecture

Cette section contient tous les services de l'application, organisés par domaine fonctionnel.

## Structure des Services

### 🔐 **Services d'Authentification**
- **`authService.ts`** - Gestion de l'authentification (login, logout, tokens)
- **`userService.ts`** - Gestion des utilisateurs (CRUD, rôles)

### 📊 **Services de Contenu**
- **`categoryService.ts`** - Gestion des catégories
- **`mediaService.ts`** - Gestion des médias (chaînes YouTube, TikTok)

### ⚙️ **Services de Configuration**
- **`introService.ts`** - Gestion des vidéos d'introduction
- **`outroService.ts`** - Gestion des vidéos de conclusion
- **`languageService.ts`** - Gestion des langues
- **`configService.ts`** - Gestion des configurations de canaux

### 🔧 **Services Utilitaires**
- **`api.ts`** - Configuration Axios et intercepteurs

## Avantages de cette Architecture

### ✅ **Séparation des Responsabilités**
Chaque service a une responsabilité claire et bien définie :
- `introService` : Gère uniquement les intros
- `outroService` : Gère uniquement les outros
- `languageService` : Gère uniquement les langues
- `configService` : Gère les configurations de canaux

### ✅ **Maintenabilité**
- Code plus facile à maintenir et à déboguer
- Modifications isolées par domaine
- Tests unitaires plus simples à écrire

### ✅ **Réutilisabilité**
- Services réutilisables dans différentes parties de l'application
- Import centralisé via `src/services/index.ts`

### ✅ **Évolutivité**
- Ajout facile de nouveaux services
- Modification d'un service sans impacter les autres

## Utilisation

### Import Direct
```typescript
import introService from '@/services/introService';
import outroService from '@/services/outroService';
import languageService from '@/services/languageService';
```

### Import Centralisé
```typescript
import { introService, outroService, languageService } from '@/services';
```

## Exemple d'Utilisation

```typescript
// Créer une nouvelle intro
const newIntro = await introService.createIntro({
  name: "Nouvelle Intro",
  description: "Description de l'intro",
  source: "/templates/new-intro.html",
  duration: 5000,
  hasAnimation: true,
  customText: "Bienvenue !",
  backgroundColor: "#000000",
  textColor: "#ffffff",
  hasCallToAction: false,
  callToActionText: "",
  callToActionUrl: "",
  isActive: true
});

// Récupérer toutes les langues
const languages = await languageService.getAllLanguages();

// Mettre à jour un outro
const updatedOutro = await outroService.updateOutro(1, {
  name: "Outro Modifiée",
  isActive: false
});
```

## Migration depuis l'Ancien Système

L'ancien `configService.ts` contenait toutes les fonctionnalités. Maintenant :

- **Intros** → `introService.ts`
- **Outros** → `outroService.ts`
- **Langues** → `languageService.ts`
- **Configurations de canaux** → `configService.ts` (conservé)

### Ancien Code
```typescript
import configService from '@/services/configService';

const intros = await configService.getIntros();
const newIntro = await configService.createIntro(data);
```

### Nouveau Code
```typescript
import introService from '@/services/introService';

const intros = await introService.getAllIntros();
const newIntro = await introService.createIntro(data);
```

## API Endpoints

Chaque service est prêt à être connecté à l'API backend :

- **Intros** : `/api/admin/intros`
- **Outros** : `/api/admin/outros`
- **Langues** : `/api/admin/languages`
- **Configurations** : `/api/admin/channel-configs`

Actuellement, les services utilisent des données mockées pour le développement frontend. 