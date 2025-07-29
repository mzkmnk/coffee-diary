import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { take } from 'rxjs';
import { NetworkService } from './network.service';

describe('NetworkService', () => {
  let service: NetworkService;
  const originalNavigator = { ...window.navigator };

  beforeEach(() => {
    service = new NetworkService();
  });

  afterEach(() => {
    vi.clearAllMocks();
    // Restore original navigator
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true
    });
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('isOnline', () => {
    it('should return true when online', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true
      });

      expect(service.isOnline()).toBe(true);
    });

    it('should return false when offline', () => {
      Object.defineProperty(window.navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true
      });

      expect(service.isOnline()).toBe(false);
    });
  });

  describe('online$ observable', () => {
    it('should emit initial online status', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true
      });

      const newService = new NetworkService();
      
      const status = await new Promise<boolean>(resolve => {
        newService.online$.pipe(take(1)).subscribe(resolve);
      });
      
      expect(status).toBe(true);
    });

    it('should emit status when going online', () => {
      const onlineCallback = vi.fn();
      service.online$.subscribe(onlineCallback);

      // Clear initial call
      onlineCallback.mockClear();

      // Simulate online event
      window.dispatchEvent(new Event('online'));

      expect(onlineCallback).toHaveBeenCalledWith(true);
    });

    it('should emit status when going offline', () => {
      const offlineCallback = vi.fn();
      service.online$.subscribe(offlineCallback);

      // Clear initial call
      offlineCallback.mockClear();

      // Simulate offline event
      window.dispatchEvent(new Event('offline'));

      expect(offlineCallback).toHaveBeenCalledWith(false);
    });
  });

  describe('checkConnection', () => {
    it('should return true when online', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true
      });

      const result = await service.checkConnection();
      expect(result).toBe(true);
    });

    it('should return false when offline', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true
      });

      const result = await service.checkConnection();
      expect(result).toBe(false);
    });

    it('should try to fetch when online to verify real connection', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true
      });

      // Mock fetch to simulate successful connection
      (window as any).fetch = vi.fn().mockResolvedValue({ ok: true });

      const result = await service.checkConnection();
      expect(result).toBe(true);
      expect(fetch).toHaveBeenCalledWith('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
    });

    it('should return false when fetch fails', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true
      });

      // Mock fetch to simulate failed connection
      (window as any).fetch = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await service.checkConnection();
      expect(result).toBe(false);
    });
  });

  describe('waitForConnection', () => {
    it('should resolve immediately when online', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        value: true,
        writable: true,
        configurable: true
      });

      const start = Date.now();
      await service.waitForConnection();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100); // Should resolve quickly
    });

    it('should wait for online event when offline', async () => {
      Object.defineProperty(window.navigator, 'onLine', {
        value: false,
        writable: true,
        configurable: true
      });

      // Create a new service instance while offline
      const offlineService = new NetworkService();
      
      const waitPromise = offlineService.waitForConnection();
      let resolved = false;
      waitPromise.then(() => { resolved = true; });

      // Should not be resolved immediately
      await new Promise(resolve => setTimeout(resolve, 50));
      expect(resolved).toBe(false);

      // Simulate going online
      window.dispatchEvent(new Event('online'));

      await waitPromise;
      expect(resolved).toBe(true);
    });
  });

  describe('onStatusChange', () => {
    it('should call callback when status changes', () => {
      const callback = vi.fn();
      const unsubscribe = service.onStatusChange(callback);

      // Clear initial call
      callback.mockClear();

      // Simulate offline event
      window.dispatchEvent(new Event('offline'));
      expect(callback).toHaveBeenCalledWith(false);

      // Simulate online event
      window.dispatchEvent(new Event('online'));
      expect(callback).toHaveBeenCalledWith(true);

      // Cleanup
      unsubscribe();
    });

    it('should stop calling callback after unsubscribe', () => {
      const callback = vi.fn();
      const unsubscribe = service.onStatusChange(callback);

      // Clear initial call
      callback.mockClear();

      // Unsubscribe
      unsubscribe();

      // Simulate events - callback should not be called
      window.dispatchEvent(new Event('offline'));
      window.dispatchEvent(new Event('online'));

      expect(callback).not.toHaveBeenCalled();
    });
  });
});