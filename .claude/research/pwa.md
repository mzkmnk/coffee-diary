# PWA (Progressive Web App) 調査結果

## 概要
PWAは、ネイティブアプリのような体験をWebで提供する技術。
オフライン対応、プッシュ通知、ホーム画面への追加などが可能。

## Angular PWA実装

### 1. Angular PWAパッケージの追加
```bash
ng add @angular/pwa
```

このコマンドで以下が自動設定される：
- Service Workerの設定
- manifest.jsonの生成
- アイコンの追加
- index.htmlの更新

### 2. 主要コンポーネント

#### Service Worker設定 (ngsw-config.json)
```json
{
  "index": "/index.html",
  "assetGroups": [
    {
      "name": "app",
      "installMode": "prefetch",
      "resources": {
        "files": [
          "/favicon.ico",
          "/index.html",
          "/manifest.json",
          "/*.css",
          "/*.js"
        ]
      }
    },
    {
      "name": "assets",
      "installMode": "lazy",
      "updateMode": "prefetch",
      "resources": {
        "files": [
          "/assets/**",
          "/*.(svg|cur|jpg|jpeg|png|apng|webp|avif|gif|otf|ttf|woff|woff2)"
        ]
      }
    }
  ],
  "dataGroups": [
    {
      "name": "api-cache",
      "urls": ["https://maps.googleapis.com/maps/api/**"],
      "cacheConfig": {
        "maxSize": 100,
        "maxAge": "1d",
        "timeout": "10s",
        "strategy": "freshness"
      }
    }
  ]
}
```

#### Web App Manifest (manifest.json)
```json
{
  "name": "カフェ訪問記録",
  "short_name": "カフェ日記",
  "theme_color": "#6F4E37",
  "background_color": "#FFF8DC",
  "display": "standalone",
  "scope": "./",
  "start_url": "./",
  "icons": [
    {
      "src": "assets/icons/icon-72x72.png",
      "sizes": "72x72",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-96x96.png",
      "sizes": "96x96",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-128x128.png",
      "sizes": "128x128",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-144x144.png",
      "sizes": "144x144",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-152x152.png",
      "sizes": "152x152",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-384x384.png",
      "sizes": "384x384",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### 3. オフライン対応実装

#### Service Worker更新通知
```typescript
@Component({
  selector: 'app-root',
  template: `
    <div *ngIf="updateAvailable" class="update-notification">
      新しいバージョンが利用可能です
      <button (click)="updateApp()">更新</button>
    </div>
    <router-outlet></router-outlet>
  `
})
export class AppComponent {
  updateAvailable = false;

  constructor(private swUpdate: SwUpdate) {
    if (swUpdate.isEnabled) {
      swUpdate.versionUpdates.subscribe(evt => {
        if (evt.type === 'VERSION_READY') {
          this.updateAvailable = true;
        }
      });
    }
  }

  updateApp() {
    document.location.reload();
  }
}
```

#### オフライン検知
```typescript
@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  online$ = new BehaviorSubject<boolean>(navigator.onLine);

  constructor() {
    window.addEventListener('online', () => this.online$.next(true));
    window.addEventListener('offline', () => this.online$.next(false));
  }

  isOnline(): boolean {
    return navigator.onLine;
  }
}
```

### 4. インストール促進

```typescript
@Component({
  selector: 'app-install-prompt',
  template: `
    <div *ngIf="showInstallPrompt" class="install-prompt">
      <p>アプリをインストールして、オフラインでも使用できます</p>
      <button (click)="installApp()">インストール</button>
      <button (click)="dismissPrompt()">後で</button>
    </div>
  `
})
export class InstallPromptComponent {
  showInstallPrompt = false;
  private deferredPrompt: any;

  constructor() {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt = true;
    });
  }

  installApp() {
    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('User accepted the install prompt');
      }
      this.deferredPrompt = null;
      this.showInstallPrompt = false;
    });
  }

  dismissPrompt() {
    this.showInstallPrompt = false;
  }
}
```

## パフォーマンス最適化

### 1. App Shell パターン
```typescript
// app-shell.component.ts
@Component({
  selector: 'app-shell',
  template: `
    <div class="app-shell">
      <header class="skeleton"></header>
      <main class="skeleton-content">
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
        <div class="skeleton-item"></div>
      </main>
    </div>
  `,
  styles: [`
    .skeleton { animation: skeleton-loading 1s infinite; }
    @keyframes skeleton-loading {
      0% { opacity: 0.7; }
      50% { opacity: 1; }
      100% { opacity: 0.7; }
    }
  `]
})
export class AppShellComponent {}
```

### 2. 遅延読み込み
```typescript
const routes: Routes = [
  {
    path: 'map',
    loadChildren: () => import('./map/map.module').then(m => m.MapModule)
  },
  {
    path: 'cafes',
    loadChildren: () => import('./cafes/cafes.module').then(m => m.CafesModule)
  }
];
```

## ベストプラクティス
1. **キャッシュ戦略**: 静的アセットは積極的にキャッシュ、APIは必要に応じて
2. **更新通知**: 新バージョンの自動検知と更新促進
3. **オフライン対応**: オフライン時のUIフィードバック
4. **パフォーマンス**: 初期ロードの最適化、遅延読み込みの活用

## 推奨実装
1. `ng add @angular/pwa`でPWA基本設定
2. カスタムService Worker設定でGoogle Maps APIのキャッシュ
3. インストール促進UIの実装
4. オフライン時の適切なフィードバック