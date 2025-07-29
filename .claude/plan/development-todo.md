# 開発TODOリスト

## 即座に着手するタスク

### 1. 初期セットアップ（優先度: 最高）
```bash
# 実行コマンド
ng add @angular/pwa
npm install dexie
npm install @types/google.maps
```

- [ ] PWAセットアップ
- [ ] 必要パッケージのインストール
- [ ] 環境変数ファイルの作成（.env.local）
- [ ] gitignoreに環境変数を追加

### 2. プロジェクト構造の作成
```
src/app/
├── core/
│   ├── models/
│   │   └── cafe.model.ts
│   ├── services/
│   │   ├── cafe-storage.service.ts
│   │   ├── geocoding.service.ts
│   │   └── network.service.ts
│   └── database/
│       └── cafe.database.ts
├── features/
│   ├── cafe-list/
│   ├── cafe-form/
│   ├── cafe-detail/
│   └── map/
├── shared/
│   ├── components/
│   └── utils/
└── styles/
    └── _variables.scss
```

## 詳細タスクリスト

### Phase 1: 基盤構築

#### 1-1. モデル定義
```typescript
// cafe.model.ts
export interface Cafe {
  id?: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  visitDate: Date;
  rating: number;
  memo: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### 1-2. データベース設定
```typescript
// cafe.database.ts
import Dexie from 'dexie';

export class CafeDatabase extends Dexie {
  cafes!: Table<Cafe>;
  
  constructor() {
    super('CafeDiaryDB');
    this.version(1).stores({
      cafes: '++id, name, visitDate, rating, [lat+lng]'
    });
  }
}
```

#### 1-3. 基本サービス
- [ ] CafeStorageService実装
  - [ ] addCafe()
  - [ ] getAllCafes()
  - [ ] getCafeById()
  - [ ] updateCafe()
  - [ ] deleteCafe()
  - [ ] searchCafes()
  
- [ ] GeocodingService実装
  - [ ] geocodeAddress()
  - [ ] reverseGeocode()
  - [ ] getCurrentLocation()

### Phase 2: UI実装タスク

#### 2-1. コンポーネント作成コマンド
```bash
# カフェ関連コンポーネント
ng generate component features/cafe-form --standalone
ng generate component features/cafe-list --standalone
ng generate component features/cafe-detail --standalone
ng generate component features/map --standalone

# 共通コンポーネント
ng generate component shared/components/loading-spinner --standalone
ng generate component shared/components/confirm-dialog --standalone
ng generate component shared/components/rating-input --standalone
```

#### 2-2. フォーム実装
- [ ] リアクティブフォーム設定
- [ ] 住所オートコンプリート
- [ ] 評価入力（星5つ）
- [ ] 日付ピッカー
- [ ] バリデーション

#### 2-3. 一覧画面
- [ ] カード形式のレイアウト
- [ ] ソート機能（日付、評価、名前）
- [ ] フィルター（評価、タグ）
- [ ] 無限スクロール

### Phase 3: 地図実装タスク

#### 3-1. SVG準備
- [ ] geoloniaからSVGデータ取得
- [ ] assetsフォルダに配置
- [ ] 最適化（SVGO）

#### 3-2. 地図コンポーネント
- [ ] SVG描画
- [ ] ビューポート管理
- [ ] マーカー描画
- [ ] イベントハンドリング

#### 3-3. 操作実装
- [ ] マウスドラッグ
- [ ] ホイールズーム
- [ ] タッチ操作
- [ ] ダブルクリックズーム

### Phase 4: PWA最適化タスク

#### 4-1. Service Worker設定
- [ ] ngsw-config.json調整
- [ ] API呼び出しのキャッシュ
- [ ] 画像のキャッシュ戦略

#### 4-2. manifest.json
- [ ] アプリ名設定
- [ ] アイコン作成（各サイズ）
- [ ] テーマカラー設定
- [ ] スプラッシュ画面

#### 4-3. UX向上
- [ ] スケルトンスクリーン
- [ ] プルトゥリフレッシュ
- [ ] オフラインインジケーター
- [ ] インストールプロンプト

## 技術的な実装メモ

### スタイリング方針
```scss
// _variables.scss
$primary-color: #6F4E37; // コーヒーブラウン
$secondary-color: #D2691E; // チョコレート
$background-color: #FFF8DC; // コーンシルク
$text-color: #333;
$border-radius: 8px;
$shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
```

### アニメーション
```scss
// 共通トランジション
.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

// カード hover効果
.cafe-card {
  transition: transform 0.2s, box-shadow 0.2s;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }
}
```

## テスト計画
1. **単体テスト**
   - [ ] サービスのテスト
   - [ ] コンポーネントのテスト
   - [ ] パイプ・ディレクティブのテスト

2. **統合テスト**
   - [ ] データ保存・取得フロー
   - [ ] 地図操作
   - [ ] オフライン動作

3. **E2Eテスト**
   - [ ] カフェ登録フロー
   - [ ] 検索・フィルター
   - [ ] PWAインストール

## デプロイチェックリスト
- [ ] 環境変数設定
- [ ] ビルド最適化
- [ ] Vercel.json設定
- [ ] カスタムドメイン設定（任意）
- [ ] Google Maps APIキーの本番設定
- [ ] アナリティクス設定（任意）