# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Coffee Diary is an Angular 20 application using the latest Angular features including standalone components and zoneless change detection.

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

### Project Structure
```
src/
├── app/                    # Application components and logic
│   ├── app.ts             # Root component (standalone)
│   ├── app.config.ts      # Application configuration
│   ├── app.routes.ts      # Routing configuration
│   └── *.spec.ts          # Unit tests (Vitest)
├── main.ts                # Application bootstrap
├── index.html             # SPA entry point
└── styles.css             # Global styles
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

### Development Patterns
1. **Component Creation**: Use standalone components with `imports` array
2. **Routing**: Define routes in `app.routes.ts`
3. **Services**: Inject using `inject()` function or constructor injection
4. **Change Detection**: Rely on signals and manual change detection (no Zone.js)

### Important Notes
- This is a fresh Angular 20 project with minimal customization
- The default Angular template is still in place (app.component shows Angular logo)
- Git branch `feat/claude.md` is clean with no uncommitted changes