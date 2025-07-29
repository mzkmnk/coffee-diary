# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Coffee Diary is an Angular 20 PWA (Progressive Web App) for recording and managing cafe visits. The application allows users to save visited cafes with location data, ratings, and notes, all stored locally using IndexedDB.

### プロジェクト概要
訪れたカフェの情報を記録・管理するPWAアプリケーション。Google Maps APIで位置情報を取得し、SVGベースの日本地図上にカフェをマッピングします。

## Essential Commands

### Development
- `npm run start` or `ng serve` - Start development server on http://localhost:4200
- `npm run build` - Build for production
- `npm run watch` - Build with watch mode for development

### Testing
- `npm run test` or `ng test` - Run unit tests with Vitest
- Run a single test file: `npm run test -- app.spec.ts`

### Angular CLI
- `ng generate component <name>` - Generate new component
- `ng generate service <name>` - Generate new service
- `npm run ng -- <command>` - Access Angular CLI commands

## Architecture Overview

### Key Technologies
- **Angular 20**: Latest version with standalone components
- **TypeScript 5.8**: Strict mode enabled
- **Vitest**: Modern test runner replacing Karma/Jasmine
- **pnpm**: Package manager (use `pnpm install` instead of `npm install`)
- **RxJS 7.8**: Reactive programming library
- **Dexie.js**: IndexedDB wrapper for local data storage
- **Google Maps API**: Geocoding API for address to coordinates conversion
- **@angular/pwa**: Service Worker and offline support
- **SVG Map**: Using geolonia/japanese-prefectures for Japan map visualization

### Project Structure
```
src/
├── app/                    # Application components and logic
│   ├── core/              # Core services and models
│   │   ├── models/        # Data models (Cafe interface, etc.)
│   │   ├── services/      # Core services
│   │   │   ├── cafe-storage.service.ts
│   │   │   ├── geocoding.service.ts
│   │   │   └── network.service.ts
│   │   └── database/      # IndexedDB configuration
│   ├── features/          # Feature modules
│   │   ├── cafe-list/     # Cafe list view
│   │   ├── cafe-form/     # Cafe registration/edit form
│   │   ├── cafe-detail/   # Cafe detail view
│   │   └── map/           # SVG map component
│   ├── shared/            # Shared components and utilities
│   ├── app.ts             # Root component (standalone)
│   ├── app.config.ts      # Application configuration
│   ├── app.routes.ts      # Routing configuration
│   └── *.spec.ts          # Unit tests (Vitest)
├── assets/                # Static assets
│   └── japan-map.svg      # Japan SVG map data
├── main.ts                # Application bootstrap
├── index.html             # SPA entry point
└── styles.css             # Global styles

.claude/                   # Project documentation
├── requirements/          # Requirements documents
├── research/              # Technical research
├── plan/                  # Project plans and TODOs
└── design/                # UI/UX design guidelines
```

### Key Configuration Features
1. **Zoneless Change Detection**: Enabled for better performance (`provideZoneChangeDetection({ zoneless: true })`)
2. **Standalone Components**: No NgModules, components use imports array
3. **Strict TypeScript**: All strict checks enabled including template type checking
4. **Production Budgets**: 1MB initial bundle, 8KB per component style

### Testing Strategy
- Vitest with jsdom for unit testing
- Tests use `TestBed.configureTestingModule()` with component imports
- Example test pattern in `app.spec.ts`

### TDD (Test-Driven Development) 実装方針
このプロジェクトでは、t-wada（和田卓人）氏が推奨するTDD手法を採用します：
1. **Red-Green-Refactor サイクル**: まずテストを書き（Red）、最小限のコードで通し（Green）、リファクタリング（Refactor）
2. **テストファースト**: 実装前に必ずテストを書く
3. **小さなステップ**: 一度に一つのことだけをテストし、段階的に機能を追加
4. **TODOリスト駆動**: テストすべき項目をTODOリストとして管理

### Development Patterns
1. **Component Creation**: Use standalone components with `imports` array
2. **Routing**: Define routes in `app.routes.ts`
3. **Services**: Inject using `inject()` function or constructor injection
4. **Change Detection**: Rely on signals and manual change detection (no Zone.js)

### Important Notes
- This is a cafe diary PWA project for personal use
- All data is stored locally using IndexedDB (no cloud sync)
- Google Maps API key is required for geocoding functionality
- The app focuses on UX/UI quality and smooth map interactions
- **プロジェクトタスク管理**: 開発タスクは `.claude/plan/project-plan.md` を参照してください

### プロジェクト固有の開発ガイドライン

1. **データ永続化**
   - 全てのカフェデータはIndexedDBに保存
   - Dexie.jsを使用してデータベース操作を実装
   - オフライン時でも基本機能が動作するよう設計

2. **地図実装**
   - SVGベースの日本地図を使用（geolonia/japanese-prefectures）
   - Google Maps風の操作感（パン、ズーム、クリック）を実現
   - パフォーマンスを考慮したマーカークラスタリング

3. **PWA要件**
   - Service Workerでオフライン対応
   - インストール可能なアプリとして設計
   - アップデート通知機能の実装

4. **UI/UXデザイン**
   - カフェの雰囲気に合う温かみのあるデザイン
   - モバイルファーストで設計
   - スムーズなアニメーションとマイクロインタラクション

## Language Settings / 言語設定

**IMPORTANT / 重要**: In this project, Claude Code must ALWAYS respond in Japanese. Technical terms can remain in English.

このプロジェクトでは、Claude Codeは**必ず**日本語で返答してください。技術用語は英語のままで問題ありません。

### Examples / 例:

- ✅ 「componentを作成しました」
- ✅ 「TypeScriptの型定義を追加しました」
- ❌ "I've created a new component"
- ❌ "Added TypeScript type definitions"
