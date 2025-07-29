import { Injectable } from '@angular/core';
/// <reference path="../../../types/google-maps.d.ts" />

declare global {
  interface Window {
    google: typeof google;
  }
}

export interface GeocodeResult {
  lat: number;
  lng: number;
  formattedAddress: string;
}

export interface LocationResult {
  lat: number;
  lng: number;
  accuracy: number;
}

@Injectable({
  providedIn: 'root'
})
export class GeocodingService {
  private geocoder: google.maps.Geocoder | null = null;

  private ensureGeocoder(): void {
    if (!this.geocoder && this.isGoogleMapsLoaded()) {
      this.geocoder = new window.google.maps.Geocoder();
    }
  }

  async geocodeAddress(address: string): Promise<GeocodeResult> {
    this.ensureGeocoder();
    
    if (!this.isGoogleMapsLoaded() || !this.geocoder) {
      throw new Error('Google Maps API is not loaded');
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode({ address }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng(),
            formattedAddress: results[0].formatted_address
          });
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  async reverseGeocode(lat: number, lng: number): Promise<string> {
    this.ensureGeocoder();
    
    if (!this.isGoogleMapsLoaded() || !this.geocoder) {
      throw new Error('Google Maps API is not loaded');
    }

    return new Promise((resolve, reject) => {
      const location = new window.google.maps.LatLng(lat, lng);
      this.geocoder!.geocode({ location }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results && results[0]) {
          resolve(results[0].formatted_address);
        } else {
          reject(new Error(`Reverse geocoding failed: ${status}`));
        }
      });
    });
  }

  async getCurrentLocation(): Promise<LocationResult> {
    if (!navigator.geolocation) {
      throw new Error('Geolocation is not supported by this browser');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        (error) => {
          reject(new Error(`Geolocation error: ${error.message}`));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  isGoogleMapsLoaded(): boolean {
    return typeof window !== 'undefined' &&
           typeof window.google !== 'undefined' && 
           typeof window.google.maps !== 'undefined' &&
           typeof window.google.maps.Geocoder !== 'undefined';
  }
}