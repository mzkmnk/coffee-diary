# Google Maps API 調査結果

## 概要
Google Maps APIを使用して、カフェの住所から座標（緯度・経度）を取得する。

## 使用するAPI
### Geocoding API
- 住所を緯度・経度に変換
- 逆ジオコーディング（座標から住所）も可能
- 料金: 月間 $200 の無料クレジット内で利用可能（個人利用なら十分）

## 実装方法

### 1. APIキーの取得
```typescript
// environment.ts に保存
export const environment = {
  googleMapsApiKey: 'YOUR_API_KEY'
};
```

### 2. Geocoding サービスの実装例
```typescript
interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private geocoder = new google.maps.Geocoder();

  async geocodeAddress(address: string): Promise<GeocodeResult> {
    return new Promise((resolve, reject) => {
      this.geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formattedAddress: results[0].formatted_address
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }
}
```

## セキュリティ考慮事項
1. APIキーの制限設定
   - HTTPリファラー制限
   - 使用APIの制限（Geocoding APIのみ）
   
2. レート制限の実装
   - 連続リクエストの制御
   - エラーハンドリング

## 代替案
### Geolocation API（ブラウザAPI）
- 現在地の取得のみ
- 住所→座標変換は不可
- カフェ登録時の現在地取得に使用可能

```typescript
navigator.geolocation.getCurrentPosition(
  (position) => {
    const { latitude, longitude } = position.coords;
    // 現在地の座標を取得
  },
  (error) => console.error(error)
);
```

## 推奨事項
1. 初期実装ではGeocoding APIのみ使用
2. 取得した座標はIndexedDBにキャッシュ
3. オフライン時は新規ジオコーディング不可とする
4. 将来的にPlaces APIの追加検討（カフェ情報の自動取得）