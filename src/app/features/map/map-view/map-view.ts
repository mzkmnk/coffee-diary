import { Component, signal, OnInit, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CoordinateTransformService } from '../../../core/services/coordinate-transform.service';
import { CafeStorageService } from '../../../core/services/cafe-storage.service';
import { MarkerClusteringService, CafeCluster } from '../../../core/services/marker-clustering.service';
import { Cafe } from '../../../core/models/cafe.model';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './map-view.html',
  styleUrl: './map-view.css'
})
export class MapViewComponent implements OnInit {
  private http = inject(HttpClient);
  private sanitizer = inject(DomSanitizer);
  private coordinateTransform = inject(CoordinateTransformService);
  private cafeStorage = inject(CafeStorageService);
  private markerClustering = inject(MarkerClusteringService);
  
  zoomLevel = signal(1);
  panX = signal(0);
  panY = signal(0);
  
  selectedPrefecture = signal<string | null>(null);
  mapSvgContent = signal<SafeHtml>('');
  cafes = signal<Cafe[]>([]);
  selectedCafe = signal<Cafe | null>(null);
  clusters = signal<CafeCluster[]>([]);
  
  // クラスタリングを使用するかどうか
  useClustering = computed(() => this.markerClustering.shouldUseClustering(this.zoomLevel()));
  
  // SVGのviewBox情報
  svgViewBox = signal<{ x: number; y: number; width: number; height: number } | null>(null);
  
  Math = Math;
  
  // ドラッグ状態管理
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartPanX = 0;
  private dragStartPanY = 0;
  
  // ピンチズーム状態管理
  private isPinching = false;
  private lastPinchDistance = 0;
  
  // ダブルタップ検出
  private lastTapTime = 0;
  private lastTapX = 0;
  private lastTapY = 0;
  
  ngOnInit() {
    this.loadMapData();
    this.loadCafes();
  }
  
  private async loadCafes() {
    try {
      const cafes = await this.cafeStorage.getAllCafes();
      this.cafes.set(cafes);
      this.updateClusters();
    } catch (error) {
      console.error('カフェデータの読み込みに失敗:', error);
    }
  }
  
  // クラスタを更新
  private updateClusters() {
    const cafes = this.cafes();
    const clusters = this.markerClustering.clusterCafes(cafes, this.zoomLevel());
    this.clusters.set(clusters);
  }
  
  // マウスダウンイベント
  onMouseDown(event: MouseEvent) {
    this.isDragging = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragStartPanX = this.panX();
    this.dragStartPanY = this.panY();
    event.preventDefault();
  }
  
  // マウス移動イベント
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging) return;
    
    const deltaX = event.clientX - this.dragStartX;
    const deltaY = event.clientY - this.dragStartY;
    
    this.panX.set(this.dragStartPanX + deltaX);
    this.panY.set(this.dragStartPanY + deltaY);
  }
  
  // マウスアップイベント
  onMouseUp() {
    this.isDragging = false;
  }
  
  // マウスリーブイベント
  onMouseLeave() {
    this.isDragging = false;
  }
  
  // マウスホイールイベント
  onWheel(event: WheelEvent) {
    event.preventDefault();
    
    const zoomSpeed = 0.001;
    const delta = event.deltaY * -zoomSpeed;
    const newZoom = Math.max(0.5, Math.min(5, this.zoomLevel() + delta));
    
    // マウス位置を中心にズーム
    const rect = (event.target as HTMLElement).getBoundingClientRect();
    const mouseX = event.clientX - rect.left - rect.width / 2;
    const mouseY = event.clientY - rect.top - rect.height / 2;
    
    const scaleDiff = newZoom / this.zoomLevel();
    
    this.panX.set(mouseX - (mouseX - this.panX()) * scaleDiff);
    this.panY.set(mouseY - (mouseY - this.panY()) * scaleDiff);
    this.zoomLevel.set(newZoom);
    this.updateClusters();
  }
  
  // タッチ開始イベント
  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      // ダブルタップの検出
      const now = Date.now();
      const x = event.touches[0].clientX;
      const y = event.touches[0].clientY;
      
      if (now - this.lastTapTime < 300 && 
          Math.abs(x - this.lastTapX) < 30 && 
          Math.abs(y - this.lastTapY) < 30) {
        // ダブルタップズーム
        this.onDoubleTap(x, y);
        event.preventDefault();
        return;
      }
      
      this.lastTapTime = now;
      this.lastTapX = x;
      this.lastTapY = y;
      
      this.isDragging = true;
      this.dragStartX = x;
      this.dragStartY = y;
      this.dragStartPanX = this.panX();
      this.dragStartPanY = this.panY();
      event.preventDefault();
    } else if (event.touches.length === 2) {
      // ピンチズーム開始
      this.isPinching = true;
      this.lastPinchDistance = this.getPinchDistance(event.touches);
      event.preventDefault();
    }
  }
  
  // タッチ移動イベント
  onTouchMove(event: TouchEvent) {
    if (event.touches.length === 1 && this.isDragging) {
      const deltaX = event.touches[0].clientX - this.dragStartX;
      const deltaY = event.touches[0].clientY - this.dragStartY;
      
      this.panX.set(this.dragStartPanX + deltaX);
      this.panY.set(this.dragStartPanY + deltaY);
      event.preventDefault();
    } else if (event.touches.length === 2 && this.isPinching) {
      // ピンチズーム
      const currentDistance = this.getPinchDistance(event.touches);
      const scale = currentDistance / this.lastPinchDistance;
      
      const newZoom = Math.max(0.5, Math.min(5, this.zoomLevel() * scale));
      
      // ピンチ中心を計算
      const centerX = (event.touches[0].clientX + event.touches[1].clientX) / 2;
      const centerY = (event.touches[0].clientY + event.touches[1].clientY) / 2;
      
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const relativeX = centerX - rect.left - rect.width / 2;
      const relativeY = centerY - rect.top - rect.height / 2;
      
      const scaleDiff = newZoom / this.zoomLevel();
      
      this.panX.set(relativeX - (relativeX - this.panX()) * scaleDiff);
      this.panY.set(relativeY - (relativeY - this.panY()) * scaleDiff);
      this.zoomLevel.set(newZoom);
      this.updateClusters();
      
      this.lastPinchDistance = currentDistance;
      event.preventDefault();
    }
  }
  
  // タッチ終了イベント
  onTouchEnd() {
    this.isDragging = false;
    this.isPinching = false;
  }
  
  // ピンチ距離の計算
  private getPinchDistance(touches: TouchList): number {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }
  
  // ダブルタップズーム
  private onDoubleTap(x: number, y: number) {
    const currentZoom = this.zoomLevel();
    const newZoom = currentZoom < 2 ? Math.min(currentZoom * 2, 3) : 1;
    
    const rect = (document.querySelector('.map-viewport') as HTMLElement).getBoundingClientRect();
    const relativeX = x - rect.left - rect.width / 2;
    const relativeY = y - rect.top - rect.height / 2;
    
    const scaleDiff = newZoom / currentZoom;
    
    this.panX.set(relativeX - (relativeX - this.panX()) * scaleDiff);
    this.panY.set(relativeY - (relativeY - this.panY()) * scaleDiff);
    this.zoomLevel.set(newZoom);
    this.updateClusters();
  }
  
  private loadMapData() {
    this.http.get('assets/japan-map.svg', { responseType: 'text' })
      .subscribe({
        next: (svgContent) => {
          console.log('SVGコンテンツを取得:', svgContent.substring(0, 200));
          const parser = new DOMParser();
          const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
          const svgElement = svgDoc.querySelector('svg');
          
          if (svgElement) {
            // ViewBoxを取得して座標変換サービスに設定
            const viewBoxAttr = svgElement.getAttribute('viewBox');
            if (viewBoxAttr) {
              const [x, y, width, height] = viewBoxAttr.split(' ').map(Number);
              const viewBox = { x, y, width, height };
              this.svgViewBox.set(viewBox);
              this.coordinateTransform.updateSvgViewBox(viewBox);
            }
            
            const innerContent = svgElement.innerHTML;
            console.log('SVG内部コンテンツ:', innerContent.substring(0, 200));
            const safeHtml = this.sanitizer.bypassSecurityTrustHtml(innerContent);
            this.mapSvgContent.set(safeHtml);
          } else {
            console.error('SVG要素が見つかりません');
          }
        },
        error: (error) => {
          console.error('SVGの読み込みに失敗:', error);
        }
      });
  }
  
  // カフェマーカーのクリックイベント
  onCafeClick(cafe: Cafe, event: MouseEvent) {
    event.stopPropagation();
    this.selectedCafe.set(cafe);
  }
  
  // ポップアップを閉じる
  closePopup() {
    this.selectedCafe.set(null);
  }
  
  // カフェの位置をSVG座標に変換
  getCafeSvgPosition(cafe: Cafe) {
    if (!cafe.lat || !cafe.lng) {
      return null;
    }
    return this.coordinateTransform.latLngToSvg({
      lat: cafe.lat,
      lng: cafe.lng
    });
  }
  
  // クラスタのクリックイベント
  onClusterClick(cluster: CafeCluster, event: MouseEvent) {
    event.stopPropagation();
    
    // クラスタが1つのカフェのみの場合は直接ポップアップを表示
    if (cluster.cafes.length === 1) {
      this.selectedCafe.set(cluster.cafes[0]);
    } else {
      // 複数のカフェがある場合はズームイン
      const newZoom = Math.min(this.zoomLevel() * 1.5, 5);
      
      // クラスタ中心にパン
      const rect = (document.querySelector('.map-viewport') as HTMLElement).getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      this.panX.set(centerX - cluster.center.x * newZoom);
      this.panY.set(centerY - cluster.center.y * newZoom);
      this.zoomLevel.set(newZoom);
      this.updateClusters();
    }
  }
}
