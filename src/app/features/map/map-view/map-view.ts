import { Component, signal, OnInit, inject, computed, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoogleMapsLoaderService } from '../../../core/services/google-maps-loader.service';
import { CafeStorageService } from '../../../core/services/cafe-storage.service';
import { Cafe } from '../../../core/models/cafe.model';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-view.html',
  styleUrl: './map-view.css'
})
export class MapViewComponent implements OnInit, AfterViewInit {
  @ViewChild('mapContainer', { static: false }) mapContainer!: ElementRef<HTMLDivElement>;
  
  private googleMapsLoader = inject(GoogleMapsLoaderService);
  private cafeStorage = inject(CafeStorageService);
  
  private map: google.maps.Map | undefined;
  private markers: google.maps.Marker[] = [];
  private infoWindow: google.maps.InfoWindow | undefined;
  
  cafes = signal<Cafe[]>([]);
  selectedCafe = signal<Cafe | null>(null);
  isMapLoaded = signal(false);
  
  // ダークモードのモダンなスタイル
  private mapStyles: google.maps.MapTypeStyle[] = [
    // 基本的な背景色
    {
      elementType: 'geometry',
      stylers: [{ color: '#1a1a2e' }]
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#1a1a2e' }]
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ color: '#8892b0' }]
    },
    // 水域
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#0f0f1e' }]
    },
    {
      featureType: 'water',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#4a5568' }]
    },
    // 地形
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#16213e' }]
    },
    {
      featureType: 'landscape.natural',
      elementType: 'geometry',
      stylers: [{ color: '#1e2a3a' }]
    },
    // POI（施設）
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#283046' }]
    },
    {
      featureType: 'poi',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#6b7280' }]
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#1e3a2a' }]
    },
    // 道路
    {
      featureType: 'road',
      elementType: 'geometry',
      stylers: [{ color: '#2a3447' }]
    },
    {
      featureType: 'road',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1a1a2e' }]
    },
    {
      featureType: 'road',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca3af' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry',
      stylers: [{ color: '#374357' }]
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#1f2937' }]
    },
    // 交通機関
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#2a3447' }]
    },
    {
      featureType: 'transit.station',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca3af' }]
    },
    // 行政区画
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#4a5568' }]
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#9ca3af' }]
    },
    {
      featureType: 'administrative.province',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#4a5568', weight: 1 }]
    }
  ];
  
  ngOnInit() {
    this.loadCafes();
  }
  
  async ngAfterViewInit() {
    await this.initializeMap();
  }
  
  private async initializeMap() {
    try {
      await this.googleMapsLoader.load();
      
      if (!this.mapContainer) {
        console.error('Map container not found');
        return;
      }
      
      // 日本の中心座標
      const japanCenter = { lat: 36.5, lng: 138.0 };
      
      const mapOptions: google.maps.MapOptions = {
        center: japanCenter,
        zoom: 5,
        disableDefaultUI: true,  // すべてのデフォルトUIを無効化
        zoomControl: false,       // ズームコントロールを無効化
        mapTypeControl: false,    // 地図タイプ切替を無効化
        scaleControl: false,      // スケール表示を無効化
        streetViewControl: false, // ストリートビューを無効化
        rotateControl: false,     // 回転コントロールを無効化
        fullscreenControl: false, // フルスクリーンボタンを無効化
        styles: this.mapStyles,
        gestureHandling: 'greedy', // タッチ操作を即座に反応
        restriction: {
          latLngBounds: {
            north: 46.0,
            south: 24.0,
            east: 154.0,
            west: 122.0
          },
          strictBounds: false
        }
      };
      
      this.map = new google.maps.Map(this.mapContainer.nativeElement, mapOptions);
      this.infoWindow = new google.maps.InfoWindow();
      
      this.isMapLoaded.set(true);
      this.displayCafes();
      
    } catch (error) {
      console.error('Google Mapsの初期化に失敗:', error);
    }
  }
  
  private async loadCafes() {
    try {
      const cafes = await this.cafeStorage.getAllCafes();
      this.cafes.set(cafes);
      if (this.isMapLoaded()) {
        this.displayCafes();
      }
    } catch (error) {
      console.error('カフェデータの読み込みに失敗:', error);
    }
  }
  
  private displayCafes() {
    if (!this.map) return;
    
    // 既存のマーカーをクリア
    this.clearMarkers();
    
    const cafes = this.cafes();
    const bounds = new google.maps.LatLngBounds();
    
    cafes.forEach(cafe => {
      if (cafe.lat && cafe.lng) {
        const position = { lat: cafe.lat, lng: cafe.lng };
        
        const marker = new google.maps.Marker({
          position,
          map: this.map,
          title: cafe.name,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <linearGradient id="coffeeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:#f97316;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:#ea580c;stop-opacity:1" />
                  </linearGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                <circle cx="18" cy="18" r="14" fill="url(#coffeeGrad)" stroke="#1a1a2e" stroke-width="2" filter="url(#glow)"/>
                <text x="18" y="23" text-anchor="middle" font-size="18" fill="white" font-weight="bold">☕</text>
              </svg>
            `),
            scaledSize: new google.maps.Size(36, 36),
            anchor: new google.maps.Point(18, 18)
          },
          animation: google.maps.Animation.DROP
        });
        
        marker.addListener('click', () => {
          this.showCafeInfo(cafe, marker);
        });
        
        this.markers.push(marker);
        bounds.extend(position);
      }
    });
    
    // すべてのマーカーが表示されるようにズーム調整
    if (cafes.length > 0 && cafes.some(c => c.lat && c.lng)) {
      this.map.fitBounds(bounds);
    }
  }
  
  private clearMarkers() {
    this.markers.forEach(marker => {
      marker.setMap(null);
    });
    this.markers = [];
  }
  
  private showCafeInfo(cafe: Cafe, marker: google.maps.Marker) {
    if (!this.infoWindow || !this.map) return;
    
    const content = `
      <div style="
        padding: 16px;
        min-width: 240px;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      ">
        <h3 style="
          margin: 0 0 12px 0;
          color: #f97316;
          font-size: 18px;
          font-weight: 600;
          letter-spacing: -0.02em;
        ">${cafe.name}</h3>
        
        ${cafe.address ? `
          <div style="
            margin: 8px 0;
            color: #94a3b8;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 8px;
          ">
            <span style="color: #f97316;">📍</span>
            ${cafe.address}
          </div>
        ` : ''}
        
        ${cafe.rating ? `
          <div style="
            margin: 8px 0;
            color: #fbbf24;
            font-size: 16px;
          ">
            ${'★'.repeat(cafe.rating)}${'☆'.repeat(5 - cafe.rating)}
          </div>
        ` : ''}
        
        ${cafe.memo ? `
          <p style="
            margin: 12px 0 8px 0;
            color: #cbd5e1;
            font-size: 14px;
            line-height: 1.5;
            border-top: 1px solid #374151;
            padding-top: 12px;
          ">${cafe.memo}</p>
        ` : ''}
        
        ${cafe.visitDate ? `
          <p style="
            margin: 8px 0 0 0;
            font-size: 12px;
            color: #64748b;
            text-align: right;
          ">訪問日: ${new Date(cafe.visitDate).toLocaleDateString('ja-JP')}</p>
        ` : ''}
      </div>
    `;
    
    this.infoWindow.setContent(content);
    this.infoWindow.open(this.map, marker);
    this.selectedCafe.set(cafe);
  }
  
  
  // 中心を日本に戻す
  centerToJapan() {
    if (!this.map) return;
    
    const japanCenter = { lat: 36.5, lng: 138.0 };
    this.map.setCenter(japanCenter);
    this.map.setZoom(5);
  }
}
