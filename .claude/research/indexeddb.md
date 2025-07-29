# IndexedDB 調査結果

## 概要
ブラウザのローカルストレージAPIで、大容量データの保存が可能。
PWAでのオフラインデータ管理に最適。

## 特徴
- **容量**: 一般的に数GB（ブラウザとデバイスに依存）
- **非同期API**: Promiseベースで実装可能
- **トランザクション**: データの整合性を保証
- **インデックス**: 高速な検索が可能

## Angular向けライブラリ

### 1. Dexie.js（推奨）
最も人気のあるIndexedDBラッパーライブラリ

```typescript
import Dexie, { Table } from 'dexie';

export interface Cafe {
  id?: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  visitDate: Date;
  rating: number;
  memo: string;
  photos?: string[]; // Base64またはBlob URL
}

export class CafeDatabase extends Dexie {
  cafes!: Table<Cafe>;

  constructor() {
    super('CafeDiaryDB');
    this.version(1).stores({
      cafes: '++id, name, visitDate, rating, [lat+lng]'
    });
  }
}

// 使用例
const db = new CafeDatabase();

// 追加
await db.cafes.add({
  name: 'Blue Bottle Coffee',
  address: '東京都渋谷区...',
  lat: 35.6580,
  lng: 139.7016,
  visitDate: new Date(),
  rating: 5,
  memo: '美味しいコーヒー'
});

// 検索
const cafes = await db.cafes
  .where('rating')
  .above(4)
  .toArray();
```

### 2. @angular/pwa スキーマティック統合
Angular PWAと相性が良い実装パターン

```typescript
@Injectable({
  providedIn: 'root'
})
export class CafeStorageService {
  private db = new CafeDatabase();

  async addCafe(cafe: Omit<Cafe, 'id'>): Promise<number> {
    return await this.db.cafes.add(cafe);
  }

  async getAllCafes(): Promise<Cafe[]> {
    return await this.db.cafes.toArray();
  }

  async getCafesByArea(minLat: number, maxLat: number, minLng: number, maxLng: number): Promise<Cafe[]> {
    return await this.db.cafes
      .where('lat').between(minLat, maxLat)
      .and(cafe => cafe.lng >= minLng && cafe.lng <= maxLng)
      .toArray();
  }

  async updateCafe(id: number, updates: Partial<Cafe>): Promise<void> {
    await this.db.cafes.update(id, updates);
  }

  async deleteCafe(id: number): Promise<void> {
    await this.db.cafes.delete(id);
  }
}
```

## データスキーマ設計

```typescript
// バージョン1のスキーマ
interface CafeV1 {
  id?: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  visitDate: Date;
  rating: number;
  memo: string;
  createdAt: Date;
  updatedAt: Date;
}

// 将来の拡張（バージョン2）
interface CafeV2 extends CafeV1 {
  photos: Array<{
    id: string;
    url: string;
    thumbnail: string;
    uploadedAt: Date;
  }>;
  tags: string[];
  priceRange: number;
}
```

## ストレージ管理

### 容量管理
```typescript
// ストレージ使用量の確認
if ('storage' in navigator && 'estimate' in navigator.storage) {
  const estimate = await navigator.storage.estimate();
  console.log(`使用量: ${estimate.usage} / ${estimate.quota}`);
}
```

### データエクスポート/インポート
```typescript
// エクスポート
async exportData(): Promise<string> {
  const cafes = await this.db.cafes.toArray();
  return JSON.stringify(cafes);
}

// インポート
async importData(jsonData: string): Promise<void> {
  const cafes = JSON.parse(jsonData);
  await this.db.cafes.bulkPut(cafes);
}
```

## ベストプラクティス
1. **インデックス設計**: 頻繁に検索する項目にインデックスを設定
2. **バージョニング**: スキーマ変更時のマイグレーション戦略
3. **エラーハンドリング**: QuotaExceededErrorへの対処
4. **バックアップ**: 定期的なエクスポート機能の提供

## 推奨実装
1. Dexie.jsを使用したIndexedDB実装
2. Angular ServiceでのDB操作のカプセル化
3. RxJSとの統合でリアクティブなデータ管理
4. 写真データはBase64よりBlob URLを推奨（メモリ効率）