import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-map-view',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './map-view.html',
  styleUrl: './map-view.css'
})
export class MapViewComponent implements OnInit {
  private http = inject(HttpClient);
  
  zoomLevel = signal(1);
  panX = signal(0);
  panY = signal(0);
  
  selectedPrefecture = signal<string | null>(null);
  mapSvgContent = signal<string>('');
  
  Math = Math;
  
  ngOnInit() {
    this.loadMapData();
  }
  
  private loadMapData() {
    this.http.get('/assets/japan-map.svg', { responseType: 'text' })
      .subscribe(svgContent => {
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgContent, 'image/svg+xml');
        const svgElement = svgDoc.querySelector('svg');
        
        if (svgElement) {
          const innerContent = svgElement.innerHTML;
          this.mapSvgContent.set(innerContent);
        }
      });
  }
}
