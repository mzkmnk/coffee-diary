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
  
  ngOnInit() {
    this.loadMapData();
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
