import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import 'fake-indexeddb/auto';
import { CafeStorageService } from './cafe-storage.service';
import type { Cafe } from '../models/cafe.model';

describe('CafeStorageService', () => {
  let service: CafeStorageService;

  beforeEach(() => {
    service = new CafeStorageService();
  });

  afterEach(async () => {
    // データベースをクリーンアップ
    if (service) {
      await service.clearAll();
    }
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('addCafe', () => {
    it('should add a new cafe', async () => {
      const newCafe: Omit<Cafe, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Test Cafe',
        address: '東京都渋谷区1-1-1',
        lat: 35.6580,
        lng: 139.7016,
        visitDate: new Date(),
        rating: 4,
        memo: 'テスト用カフェ',
        tags: ['WiFi', '電源あり']
      };

      const id = await service.addCafe(newCafe);
      expect(id).toBeGreaterThan(0);

      const cafe = await service.getCafeById(id);
      expect(cafe).toBeDefined();
      expect(cafe?.name).toBe('Test Cafe');
      expect(cafe?.createdAt).toBeDefined();
      expect(cafe?.updatedAt).toBeDefined();
    });

    it('should validate rating range', async () => {
      const invalidCafe: Omit<Cafe, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Invalid Rating Cafe',
        address: '東京都渋谷区1-1-1',
        lat: 35.6580,
        lng: 139.7016,
        visitDate: new Date(),
        rating: 6, // 無効な評価
        memo: 'テスト'
      };

      await expect(service.addCafe(invalidCafe)).rejects.toThrow('Rating must be between 1 and 5');
    });
  });

  describe('getAllCafes', () => {
    it('should return all cafes', async () => {
      const cafes: Omit<Cafe, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Cafe 1',
          address: '東京都渋谷区1-1-1',
          lat: 35.6580,
          lng: 139.7016,
          visitDate: new Date(),
          rating: 5,
          memo: 'カフェ1'
        },
        {
          name: 'Cafe 2',
          address: '東京都新宿区2-2-2',
          lat: 35.6896,
          lng: 139.7006,
          visitDate: new Date(),
          rating: 3,
          memo: 'カフェ2'
        }
      ];

      for (const cafe of cafes) {
        await service.addCafe(cafe);
      }

      const allCafes = await service.getAllCafes();
      expect(allCafes).toHaveLength(2);
      expect(allCafes[0].name).toBe('Cafe 1');
      expect(allCafes[1].name).toBe('Cafe 2');
    });
  });

  describe('getCafeById', () => {
    it('should return a cafe by id', async () => {
      const newCafe: Omit<Cafe, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Specific Cafe',
        address: '東京都渋谷区1-1-1',
        lat: 35.6580,
        lng: 139.7016,
        visitDate: new Date(),
        rating: 4,
        memo: '特定のカフェ'
      };

      const id = await service.addCafe(newCafe);
      const cafe = await service.getCafeById(id);

      expect(cafe).toBeDefined();
      expect(cafe?.id).toBe(id);
      expect(cafe?.name).toBe('Specific Cafe');
    });

    it('should return undefined for non-existent id', async () => {
      const cafe = await service.getCafeById(9999);
      expect(cafe).toBeUndefined();
    });
  });

  describe('updateCafe', () => {
    it('should update an existing cafe', async () => {
      const newCafe: Omit<Cafe, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'Original Name',
        address: '東京都渋谷区1-1-1',
        lat: 35.6580,
        lng: 139.7016,
        visitDate: new Date(),
        rating: 3,
        memo: '元のメモ'
      };

      const id = await service.addCafe(newCafe);
      const originalCafe = await service.getCafeById(id);
      const originalUpdatedAt = originalCafe?.updatedAt;

      // 少し待機してupdatedAtが確実に変わるようにする
      await new Promise(resolve => setTimeout(resolve, 10));

      await service.updateCafe(id, { name: 'Updated Name', rating: 5 });
      const updatedCafe = await service.getCafeById(id);

      expect(updatedCafe?.name).toBe('Updated Name');
      expect(updatedCafe?.rating).toBe(5);
      expect(updatedCafe?.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt!.getTime());
    });

    it('should validate rating on update', async () => {
      const id = await service.addCafe({
        name: 'Test Cafe',
        address: '東京都渋谷区1-1-1',
        lat: 35.6580,
        lng: 139.7016,
        visitDate: new Date(),
        rating: 3,
        memo: 'テスト'
      });

      await expect(service.updateCafe(id, { rating: 0 })).rejects.toThrow('Rating must be between 1 and 5');
    });
  });

  describe('deleteCafe', () => {
    it('should delete a cafe', async () => {
      const id = await service.addCafe({
        name: 'To Be Deleted',
        address: '東京都渋谷区1-1-1',
        lat: 35.6580,
        lng: 139.7016,
        visitDate: new Date(),
        rating: 3,
        memo: '削除予定'
      });

      await service.deleteCafe(id);
      const deletedCafe = await service.getCafeById(id);
      expect(deletedCafe).toBeUndefined();
    });
  });

  describe('searchCafes', () => {
    beforeEach(async () => {
      const cafes: Omit<Cafe, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Blue Bottle Coffee',
          address: '東京都渋谷区1-1-1',
          lat: 35.6580,
          lng: 139.7016,
          visitDate: new Date('2024-01-15'),
          rating: 5,
          memo: '美味しいコーヒー',
          tags: ['WiFi', '電源あり']
        },
        {
          name: 'Starbucks Reserve',
          address: '東京都新宿区2-2-2',
          lat: 35.6896,
          lng: 139.7006,
          visitDate: new Date('2024-01-10'),
          rating: 4,
          memo: '広々とした空間',
          tags: ['WiFi']
        },
        {
          name: 'ドトールコーヒー',
          address: '東京都渋谷区3-3-3',
          lat: 35.6590,
          lng: 139.7020,
          visitDate: new Date('2024-01-05'),
          rating: 3,
          memo: '駅から近い'
        }
      ];

      for (const cafe of cafes) {
        await service.addCafe(cafe);
      }
    });

    it('should search cafes by name', async () => {
      const results = await service.searchCafes({ name: 'Blue' });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Blue Bottle Coffee');
    });

    it('should search cafes by minimum rating', async () => {
      const results = await service.searchCafes({ minRating: 4 });
      expect(results).toHaveLength(2);
      expect(results.every(cafe => cafe.rating >= 4)).toBe(true);
    });

    it('should search cafes by tags', async () => {
      const results = await service.searchCafes({ tags: ['電源あり'] });
      expect(results).toHaveLength(1);
      expect(results[0].name).toBe('Blue Bottle Coffee');
    });

    it('should search cafes by multiple criteria', async () => {
      const results = await service.searchCafes({ 
        minRating: 4,
        tags: ['WiFi']
      });
      expect(results).toHaveLength(2);
    });
  });

  describe('getCafesByArea', () => {
    it('should return cafes within specified area', async () => {
      const cafes: Omit<Cafe, 'id' | 'createdAt' | 'updatedAt'>[] = [
        {
          name: 'Area Cafe 1',
          address: '東京都渋谷区1-1-1',
          lat: 35.6580,
          lng: 139.7016,
          visitDate: new Date(),
          rating: 4,
          memo: 'エリア内'
        },
        {
          name: 'Area Cafe 2',
          address: '東京都渋谷区2-2-2',
          lat: 35.6585,
          lng: 139.7020,
          visitDate: new Date(),
          rating: 4,
          memo: 'エリア内'
        },
        {
          name: 'Outside Cafe',
          address: '東京都新宿区3-3-3',
          lat: 35.6896,
          lng: 139.7006,
          visitDate: new Date(),
          rating: 4,
          memo: 'エリア外'
        }
      ];

      for (const cafe of cafes) {
        await service.addCafe(cafe);
      }

      const areaCafes = await service.getCafesByArea(35.657, 35.659, 139.701, 139.703);
      expect(areaCafes).toHaveLength(2);
      expect(areaCafes.every(cafe => cafe.name.includes('Area Cafe'))).toBe(true);
    });
  });
});