import { Injectable } from '@angular/core';

export interface LatLng {
  lat: number;
  lng: number;
}

export interface SvgPoint {
  x: number;
  y: number;
}

@Injectable({
  providedIn: 'root'
})
export class CoordinateTransformService {
  // 日本の地理的境界
  private readonly JAPAN_BOUNDS = {
    north: 45.5572,  // 北海道最北端
    south: 20.4229,  // 沖縄最南端
    east: 153.9868,  // 東端
    west: 122.9333   // 西端
  };

  // SVGのviewBox（実際のSVGファイルに合わせて調整が必要）
  private readonly SVG_VIEWBOX = {
    x: 0,
    y: 0,
    width: 1000,
    height: 1000
  };

  constructor() {}

  /**
   * 緯度経度をSVG座標に変換
   */
  latLngToSvg(latLng: LatLng): SvgPoint {
    const { lat, lng } = latLng;
    
    // 緯度経度を0-1の範囲に正規化
    const normalizedX = (lng - this.JAPAN_BOUNDS.west) / 
                       (this.JAPAN_BOUNDS.east - this.JAPAN_BOUNDS.west);
    const normalizedY = 1 - (lat - this.JAPAN_BOUNDS.south) / 
                       (this.JAPAN_BOUNDS.north - this.JAPAN_BOUNDS.south);
    
    // SVG座標に変換
    const svgX = this.SVG_VIEWBOX.x + normalizedX * this.SVG_VIEWBOX.width;
    const svgY = this.SVG_VIEWBOX.y + normalizedY * this.SVG_VIEWBOX.height;
    
    return { x: svgX, y: svgY };
  }

  /**
   * SVG座標を緯度経度に変換
   */
  svgToLatLng(point: SvgPoint): LatLng {
    const { x, y } = point;
    
    // SVG座標を0-1の範囲に正規化
    const normalizedX = (x - this.SVG_VIEWBOX.x) / this.SVG_VIEWBOX.width;
    const normalizedY = (y - this.SVG_VIEWBOX.y) / this.SVG_VIEWBOX.height;
    
    // 緯度経度に変換
    const lng = this.JAPAN_BOUNDS.west + 
               normalizedX * (this.JAPAN_BOUNDS.east - this.JAPAN_BOUNDS.west);
    const lat = this.JAPAN_BOUNDS.south + 
               (1 - normalizedY) * (this.JAPAN_BOUNDS.north - this.JAPAN_BOUNDS.south);
    
    return { lat, lng };
  }

  /**
   * 指定された緯度経度が日本の境界内にあるかチェック
   */
  isInJapanBounds(latLng: LatLng): boolean {
    const { lat, lng } = latLng;
    return lat >= this.JAPAN_BOUNDS.south && lat <= this.JAPAN_BOUNDS.north &&
           lng >= this.JAPAN_BOUNDS.west && lng <= this.JAPAN_BOUNDS.east;
  }

  /**
   * SVGファイルのviewBoxを更新（SVGロード時に呼び出す）
   */
  updateSvgViewBox(viewBox: { x: number; y: number; width: number; height: number }): void {
    this.SVG_VIEWBOX.x = viewBox.x;
    this.SVG_VIEWBOX.y = viewBox.y;
    this.SVG_VIEWBOX.width = viewBox.width;
    this.SVG_VIEWBOX.height = viewBox.height;
  }
}