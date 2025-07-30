import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { CoordinateTransformService } from './coordinate-transform.service';

describe('CoordinateTransformService', () => {
  let service: CoordinateTransformService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()]
    });
    service = TestBed.inject(CoordinateTransformService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('latLngToSvg', () => {
    it('should convert Tokyo coordinates to SVG point', () => {
      const tokyo = { lat: 35.6762, lng: 139.6503 };
      const svgPoint = service.latLngToSvg(tokyo);
      
      expect(svgPoint.x).toBeGreaterThan(0);
      expect(svgPoint.x).toBeLessThan(1000);
      expect(svgPoint.y).toBeGreaterThan(0);
      expect(svgPoint.y).toBeLessThan(1000);
    });

    it('should convert Sapporo coordinates to SVG point', () => {
      const sapporo = { lat: 43.0642, lng: 141.3469 };
      const svgPoint = service.latLngToSvg(sapporo);
      
      // 札幌は北にあるのでy座標は小さくなるはず
      expect(svgPoint.y).toBeLessThan(500);
    });

    it('should convert Okinawa coordinates to SVG point', () => {
      const okinawa = { lat: 26.2124, lng: 127.6809 };
      const svgPoint = service.latLngToSvg(okinawa);
      
      // 沖縄は南にあるのでy座標は大きくなるはず
      expect(svgPoint.y).toBeGreaterThan(500);
    });
  });

  describe('svgToLatLng', () => {
    it('should convert SVG point back to lat/lng', () => {
      const originalLatLng = { lat: 35.6762, lng: 139.6503 };
      const svgPoint = service.latLngToSvg(originalLatLng);
      const convertedLatLng = service.svgToLatLng(svgPoint);
      
      expect(convertedLatLng.lat).toBeCloseTo(originalLatLng.lat, 4);
      expect(convertedLatLng.lng).toBeCloseTo(originalLatLng.lng, 4);
    });
  });

  describe('isInJapanBounds', () => {
    it('should return true for locations in Japan', () => {
      expect(service.isInJapanBounds({ lat: 35.6762, lng: 139.6503 })).toBe(true); // Tokyo
      expect(service.isInJapanBounds({ lat: 43.0642, lng: 141.3469 })).toBe(true); // Sapporo
      expect(service.isInJapanBounds({ lat: 34.6937, lng: 135.5023 })).toBe(true); // Osaka
    });

    it('should return false for locations outside Japan', () => {
      expect(service.isInJapanBounds({ lat: 37.7749, lng: -122.4194 })).toBe(false); // San Francisco
      expect(service.isInJapanBounds({ lat: 51.5074, lng: -0.1278 })).toBe(false); // London
      expect(service.isInJapanBounds({ lat: -33.8688, lng: 151.2093 })).toBe(false); // Sydney
    });
  });

  describe('updateSvgViewBox', () => {
    it('should update SVG viewBox', () => {
      const newViewBox = { x: 100, y: 100, width: 800, height: 800 };
      service.updateSvgViewBox(newViewBox);
      
      // 新しいviewBoxで変換が正しく動作することを確認
      const tokyo = { lat: 35.6762, lng: 139.6503 };
      const svgPoint = service.latLngToSvg(tokyo);
      
      expect(svgPoint.x).toBeGreaterThan(100);
      expect(svgPoint.x).toBeLessThan(900);
      expect(svgPoint.y).toBeGreaterThan(100);
      expect(svgPoint.y).toBeLessThan(900);
    });
  });
});