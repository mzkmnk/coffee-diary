import { Component } from '@angular/core';

@Component({
  selector: 'app-map',
  standalone: true,
  template: `
    <div class="map-container">
      <h1>地図ビュー</h1>
      <p>ここに日本地図が表示されます</p>
    </div>
  `,
  styles: [`
    .map-container {
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class MapComponent {}