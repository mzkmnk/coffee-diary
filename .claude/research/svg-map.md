# SVG日本地図実装 調査結果

## 概要
geolonia/japanese-prefecturesを使用して、Google Maps風の操作感を持つSVG地図を実装する。

## geolonia/japanese-prefectures
GitHubリポジトリ: https://github.com/geolonia/japanese-prefectures

### 特徴
- 日本の都道府県境界のSVGパスデータ
- 市区町村レベルのデータも利用可能
- GeoJSON形式でも提供
- 軽量で高速な描画

## 実装方針

### 1. SVG地図コンポーネント
```typescript
@Component({
  selector: 'app-japan-map',
  template: `
    <div class="map-container" 
         (wheel)="onWheel($event)"
         (mousedown)="onMouseDown($event)"
         (mousemove)="onMouseMove($event)"
         (mouseup)="onMouseUp()">
      <svg [attr.viewBox]="viewBox" 
           [style.transform]="transform">
        <!-- 都道府県 -->
        <g class="prefectures">
          <path *ngFor="let prefecture of prefectures"
                [attr.d]="prefecture.path"
                [attr.fill]="'#f0f0f0'"
                [attr.stroke]="'#ccc'"
                class="prefecture">
          </path>
        </g>
        <!-- カフェマーカー -->
        <g class="markers">
          <circle *ngFor="let cafe of cafes"
                  [attr.cx]="cafe.x"
                  [attr.cy]="cafe.y"
                  r="5"
                  fill="#6F4E37"
                  class="cafe-marker"
                  (click)="onCafeClick(cafe)">
          </circle>
        </g>
      </svg>
      <!-- カフェ情報ポップアップ -->
      <div *ngIf="selectedCafe" 
           class="cafe-popup"
           [style.left.px]="popupPosition.x"
           [style.top.px]="popupPosition.y">
        <h3>{{ selectedCafe.name }}</h3>
        <p>{{ selectedCafe.address }}</p>
        <p>評価: {{ selectedCafe.rating }}★</p>
      </div>
    </div>
  `,
  styleUrls: ['./japan-map.component.css']
})
export class JapanMapComponent implements OnInit {
  prefectures: any[] = [];
  cafes: any[] = [];
  selectedCafe: any = null;
  
  // ビューポートとズーム
  viewBox = '0 0 1000 1000';
  scale = 1;
  translateX = 0;
  translateY = 0;
  
  // ドラッグ状態
  isDragging = false;
  dragStartX = 0;
  dragStartY = 0;
  
  get transform(): string {
    return `scale(${this.scale}) translate(${this.translateX}px, ${this.translateY}px)`;
  }
  
  ngOnInit() {
    this.loadMapData();
    this.loadCafes();
  }
  
  async loadMapData() {
    // geoloniaのデータを読み込み
    const response = await fetch('assets/japan-prefectures.json');
    this.prefectures = await response.json();
  }
  
  // Google Maps風の操作
  onWheel(event: WheelEvent) {
    event.preventDefault();
    const delta = event.deltaY > 0 ? 0.9 : 1.1;
    this.scale = Math.max(0.5, Math.min(5, this.scale * delta));
  }
  
  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.dragStartX = event.clientX - this.translateX;
    this.dragStartY = event.clientY - this.translateY;
  }
  
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    this.translateX = event.clientX - this.dragStartX;
    this.translateY = event.clientY - this.dragStartY;
  }
  
  onMouseUp() {
    this.isDragging = false;
  }
  
  // 緯度経度をSVG座標に変換
  latLngToSvg(lat: number, lng: number): {x: number, y: number} {
    // メルカトル図法の簡易実装
    const x = (lng - 122) * 20;  // 日本の経度範囲: 122-146
    const y = (46 - lat) * 30;   // 日本の緯度範囲: 24-46
    return { x, y };
  }
}
```

### 2. スムーズなアニメーション
```css
.map-container {
  width: 100%;
  height: 100vh;
  overflow: hidden;
  cursor: grab;
}

.map-container:active {
  cursor: grabbing;
}

svg {
  width: 100%;
  height: 100%;
  transition: transform 0.1s ease-out;
}

.prefecture {
  transition: fill 0.2s;
}

.prefecture:hover {
  fill: #e0e0e0;
}

.cafe-marker {
  cursor: pointer;
  transition: all 0.2s;
}

.cafe-marker:hover {
  r: 8;
  fill: #8B6F47;
}

.cafe-popup {
  position: absolute;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
  animation: fadeIn 0.2s;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### 3. パフォーマンス最適化

#### クラスタリング実装
```typescript
interface Cluster {
  center: {x: number, y: number};
  cafes: Cafe[];
}

function clusterCafes(cafes: Cafe[], zoom: number): Cluster[] {
  const clusterRadius = 50 / zoom; // ズームレベルに応じて調整
  const clusters: Cluster[] = [];
  
  cafes.forEach(cafe => {
    const point = latLngToSvg(cafe.lat, cafe.lng);
    let added = false;
    
    for (const cluster of clusters) {
      const distance = Math.sqrt(
        Math.pow(point.x - cluster.center.x, 2) +
        Math.pow(point.y - cluster.center.y, 2)
      );
      
      if (distance < clusterRadius) {
        cluster.cafes.push(cafe);
        added = true;
        break;
      }
    }
    
    if (!added) {
      clusters.push({
        center: point,
        cafes: [cafe]
      });
    }
  });
  
  return clusters;
}
```

#### Virtual Viewport
```typescript
// 表示範囲外のマーカーは描画しない
function getVisibleCafes(cafes: Cafe[], viewport: Viewport): Cafe[] {
  return cafes.filter(cafe => {
    const point = latLngToSvg(cafe.lat, cafe.lng);
    return point.x >= viewport.minX && 
           point.x <= viewport.maxX &&
           point.y >= viewport.minY && 
           point.y <= viewport.maxY;
  });
}
```

### 4. タッチ操作対応
```typescript
// タッチイベントでのピンチズーム
let touchDistance = 0;

@HostListener('touchstart', ['$event'])
onTouchStart(event: TouchEvent) {
  if (event.touches.length === 2) {
    touchDistance = getTouchDistance(event.touches);
  }
}

@HostListener('touchmove', ['$event'])
onTouchMove(event: TouchEvent) {
  if (event.touches.length === 2) {
    const newDistance = getTouchDistance(event.touches);
    const scale = newDistance / touchDistance;
    this.scale *= scale;
    touchDistance = newDistance;
  }
}

function getTouchDistance(touches: TouchList): number {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}
```

## ベストプラクティス
1. **SVG最適化**: パスデータの簡略化（SVGOツール使用）
2. **レンダリング最適化**: RequestAnimationFrameでの描画
3. **メモリ管理**: 非表示要素のDOM削除
4. **UX向上**: 慣性スクロール、スムーズズーム

## 推奨実装
1. geoloniaのSVGデータをAngularアセットとして配置
2. カスタムSVGマップコンポーネントの作成
3. Google Maps風の操作感（パン、ズーム、クリック）
4. カフェマーカーのクラスタリング（多数表示時）
5. レスポンシブ対応とタッチ操作サポート