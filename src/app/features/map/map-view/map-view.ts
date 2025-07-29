import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

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
  
  zoomLevel = signal(1);
  panX = signal(0);
  panY = signal(0);
  
  selectedPrefecture = signal<string | null>(null);
  mapSvgContent = signal<SafeHtml>('');
  
  Math = Math;
  
  // ドラッグ状態管理
  private isDragging = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragStartPanX = 0;
  private dragStartPanY = 0;
  
  ngOnInit() {
    this.loadMapData();
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
  }
  
  // タッチ開始イベント
  onTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      this.isDragging = true;
      this.dragStartX = event.touches[0].clientX;
      this.dragStartY = event.touches[0].clientY;
      this.dragStartPanX = this.panX();
      this.dragStartPanY = this.panY();
      event.preventDefault();
    }
  }
  
  // タッチ移動イベント
  onTouchMove(event: TouchEvent) {
    if (!this.isDragging || event.touches.length !== 1) return;
    
    const deltaX = event.touches[0].clientX - this.dragStartX;
    const deltaY = event.touches[0].clientY - this.dragStartY;
    
    this.panX.set(this.dragStartPanX + deltaX);
    this.panY.set(this.dragStartPanY + deltaY);
    event.preventDefault();
  }
  
  // タッチ終了イベント
  onTouchEnd() {
    this.isDragging = false;
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
}
