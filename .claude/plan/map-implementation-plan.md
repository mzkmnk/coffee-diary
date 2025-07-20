# Coffee Diary 地図機能実装プラン

## プロジェクト概要
Google Maps Geocoding APIを使用して住所から緯度・経度を取得し、`geolonia/japanese-prefectures`ライブラリのSVG地図上にピンを配置する機能を実装します。

## Phase 1: 基盤環境設定

### TODO項目:
- [ ] Google Cloud Project設定とGeocoding API有効化
- [ ] API key取得と環境変数設定
- [ ] 必要なnpmパッケージのインストール
- [ ] TypeScript型定義の設定

### 詳細手順:
1. **Google Cloud設定**
   - Google Cloud Consoleでプロジェクト作成
   - Maps JavaScript API、Geocoding API有効化
   - API keyの作成と制限設定（HTTPリファラー制限推奨）

2. **パッケージインストール**
   ```bash
   pnpm add @angular/google-maps
   pnpm add -D @types/google.maps
   ```

3. **環境設定**
   - `src/environments/environment.ts`でAPI key管理
   - `src/environments/environment.prod.ts`での本番設定

## Phase 2: Geocodingサービス実装

### TODO項目:
- [ ] GeolocationServiceの作成
- [ ] 住所→緯度経度変換メソッド実装
- [ ] エラーハンドリングとタイムアウト処理
- [ ] RxJSを使用した非同期処理

### 実装詳細:
1. **サービス構造**
   ```typescript
   @Injectable({ providedIn: 'root' })
   export class GeolocationService {
     geocodeAddress(address: string): Observable<{lat: number, lng: number}>
     reverseGeocode(lat: number, lng: number): Observable<string>
   }
   ```

2. **エラーハンドリング**
   - ネットワークエラー
   - API制限超過
   - 住所が見つからない場合

## Phase 3: 日本地図SVG表示

### TODO項目:
- [ ] geolonia/japanese-prefecturesからSVGファイル取得
- [ ] MapDisplayComponentの作成
- [ ] SVG動的読み込み機能
- [ ] 都道府県別スタイリング

### 実装詳細:
1. **SVGファイル統合**
   - `public/assets/maps/`にSVGファイル配置
   - HTTPクライアントでSVG動的読み込み

2. **コンポーネント構造**
   ```typescript
   @Component({
     selector: 'app-map-display',
     standalone: true,
     template: `<div [innerHTML]="svgContent | safeHtml"></div>`
   })
   export class MapDisplayComponent {
     loadMap(): void
     highlightPrefecture(code: string): void
   }
   ```

## Phase 4: 座標変換とピン配置

### TODO項目:
- [ ] 緯度経度→SVG座標変換ロジック実装
- [ ] PinComponent作成
- [ ] 複数ピン管理機能
- [ ] ピンクリックイベント処理

### 技術的考慮事項:
1. **座標変換計算**
   - 日本の地理的範囲: 緯度24°-46°、経度123°-146°
   - SVGビューボックスに対する比例計算
   - メルカトル図法の考慮

2. **ピン配置アルゴリズム**
   ```typescript
   interface PinPosition {
     lat: number;
     lng: number;
     x: number; // SVG座標
     y: number; // SVG座標
     label: string;
   }
   ```

## Phase 5: 統合とテスト

### TODO項目:
- [ ] 全コンポーネントの統合
- [ ] Vitestユニットテスト作成
- [ ] E2Eテストシナリオ作成
- [ ] デモ機能とサンプルデータ実装

### テスト項目:
1. **ユニットテスト**
   - GeolocationServiceのモック化
   - 座標変換関数のテスト
   - コンポーネントの描画テスト

2. **統合テスト**
   - 住所入力→ピン配置の完全フロー
   - エラーケースの確認

## Phase 6: Coffee Diaryアプリ統合

### TODO項目:
- [ ] 既存のCoffee Diaryアプリに地図機能追加
- [ ] カフェ情報と地図の連携
- [ ] ユーザーインターフェース調整
- [ ] レスポンシブデザイン対応

### 機能仕様:
1. **カフェ登録時の地図機能**
   - 住所入力で自動位置取得
   - 手動ピン調整機能

2. **カフェ一覧での地図表示**
   - 登録済みカフェの一括表示
   - ピンクリックでカフェ詳細表示

## 技術的制約と注意事項

### API制限:
- Google Maps Geocoding API: 1日40,000リクエスト（無料枠）
- レート制限: 50リクエスト/秒

### パフォーマンス考慮:
- SVG地図のキャッシュ化
- Geocoding結果のローカルストレージ保存
- 遅延読み込み（Lazy Loading）

### セキュリティ:
- API keyの適切な制限設定
- HTTPSでの通信
- CSP（Content Security Policy）設定

## 完成イメージ
ユーザーがカフェの住所を入力すると、自動的に緯度・経度が取得され、日本地図上にピンが配置される。複数のカフェを登録すると、地図上で一覧表示され、ピンをクリックするとそのカフェの詳細情報が表示される機能を実現します。