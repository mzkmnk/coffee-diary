import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GoogleMapsLoaderService {
  private static promise: Promise<void> | null = null;

  load(): Promise<void> {
    if (GoogleMapsLoaderService.promise) {
      return GoogleMapsLoaderService.promise;
    }

    if (this.isLoaded()) {
      return Promise.resolve();
    }

    GoogleMapsLoaderService.promise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        reject(new Error('Google Maps cannot be loaded outside browser environment'));
        return;
      }

      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://maps.googleapis.com/maps/api/js?key=${environment.googleMapsApiKey}&libraries=places&language=ja&region=JP`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('Google Maps API loaded successfully');
        resolve();
      };

      script.onerror = (error) => {
        GoogleMapsLoaderService.promise = null;
        reject(new Error('Failed to load Google Maps API'));
      };

      document.head.appendChild(script);
    });

    return GoogleMapsLoaderService.promise;
  }

  isLoaded(): boolean {
    return typeof window !== 'undefined' && 
           typeof window.google !== 'undefined' && 
           typeof window.google.maps !== 'undefined';
  }
}