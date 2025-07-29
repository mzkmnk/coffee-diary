import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GeocodingService } from './geocoding.service';

describe('GeocodingService', () => {
  let service: GeocodingService;

  beforeEach(() => {
    service = new GeocodingService();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('geocodeAddress', () => {
    it('should geocode a valid address', async () => {
      // Google Maps APIのモック
      const mockGeocoder = {
        geocode: vi.fn((request: any, callback: any) => {
          const results = [{
            geometry: {
              location: {
                lat: () => 35.6580,
                lng: () => 139.7016
              }
            },
            formatted_address: '東京都渋谷区神宮前4-1-1'
          }];
          callback(results, 'OK');
        })
      };

      // window.google.maps.Geocoderのモック
      (window as any).google = {
        maps: {
          Geocoder: vi.fn(() => mockGeocoder)
        }
      };

      const result = await service.geocodeAddress('東京都渋谷区神宮前4-1-1');
      
      expect(result).toEqual({
        lat: 35.6580,
        lng: 139.7016,
        formattedAddress: '東京都渋谷区神宮前4-1-1'
      });

      expect(mockGeocoder.geocode).toHaveBeenCalledWith(
        { address: '東京都渋谷区神宮前4-1-1' },
        expect.any(Function)
      );
    });

    it('should handle geocoding errors', async () => {
      const mockGeocoder = {
        geocode: vi.fn((request: any, callback: any) => {
          callback([], 'ZERO_RESULTS');
        })
      };

      (window as any).google = {
        maps: {
          Geocoder: vi.fn(() => mockGeocoder)
        }
      };

      await expect(service.geocodeAddress('無効な住所')).rejects.toThrow('Geocoding failed: ZERO_RESULTS');
    });

    it('should handle Google Maps API not loaded', async () => {
      (window as any).google = undefined;

      await expect(service.geocodeAddress('東京都渋谷区1-1-1')).rejects.toThrow('Google Maps API is not loaded');
    });
  });

  describe('reverseGeocode', () => {
    it('should reverse geocode coordinates', async () => {
      const mockGeocoder = {
        geocode: vi.fn((request: any, callback: any) => {
          const results = [{
            formatted_address: '日本、〒150-0001 東京都渋谷区神宮前4-1-1'
          }];
          callback(results, 'OK');
        })
      };

      (window as any).google = {
        maps: {
          Geocoder: vi.fn(() => mockGeocoder),
          LatLng: vi.fn((lat, lng) => ({ lat, lng }))
        }
      };

      const result = await service.reverseGeocode(35.6580, 139.7016);
      
      expect(result).toBe('日本、〒150-0001 東京都渋谷区神宮前4-1-1');

      expect(mockGeocoder.geocode).toHaveBeenCalledWith(
        { location: { lat: 35.6580, lng: 139.7016 } },
        expect.any(Function)
      );
    });

    it('should handle reverse geocoding errors', async () => {
      const mockGeocoder = {
        geocode: vi.fn((request: any, callback: any) => {
          callback([], 'INVALID_REQUEST');
        })
      };

      (window as any).google = {
        maps: {
          Geocoder: vi.fn(() => mockGeocoder),
          LatLng: vi.fn((lat, lng) => ({ lat, lng }))
        }
      };

      await expect(service.reverseGeocode(999, 999)).rejects.toThrow('Reverse geocoding failed: INVALID_REQUEST');
    });
  });

  describe('getCurrentLocation', () => {
    it('should get current location', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((successCallback: any) => {
          successCallback({
            coords: {
              latitude: 35.6896,
              longitude: 139.7006,
              accuracy: 10
            }
          });
        })
      };

      Object.defineProperty(window.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
        configurable: true
      });

      const result = await service.getCurrentLocation();
      
      expect(result).toEqual({
        lat: 35.6896,
        lng: 139.7006,
        accuracy: 10
      });
    });

    it('should handle geolocation errors', async () => {
      const mockGeolocation = {
        getCurrentPosition: vi.fn((successCallback: any, errorCallback: any) => {
          errorCallback({
            code: 1,
            message: 'User denied Geolocation'
          });
        })
      };

      Object.defineProperty(window.navigator, 'geolocation', {
        value: mockGeolocation,
        writable: true,
        configurable: true
      });

      await expect(service.getCurrentLocation()).rejects.toThrow('Geolocation error: User denied Geolocation');
    });

    it('should handle browser without geolocation support', async () => {
      Object.defineProperty(window.navigator, 'geolocation', {
        value: undefined,
        writable: true,
        configurable: true
      });

      await expect(service.getCurrentLocation()).rejects.toThrow('Geolocation is not supported by this browser');
    });
  });

  describe('isGoogleMapsLoaded', () => {
    it('should return true when Google Maps is loaded', () => {
      (window as any).google = {
        maps: {
          Geocoder: vi.fn()
        }
      };

      expect(service.isGoogleMapsLoaded()).toBe(true);
    });

    it('should return false when Google Maps is not loaded', () => {
      (window as any).google = undefined;

      expect(service.isGoogleMapsLoaded()).toBe(false);
    });
  });
});