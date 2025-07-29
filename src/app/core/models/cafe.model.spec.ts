import { describe, it, expect } from 'vitest';
import type { Cafe } from './cafe.model';

describe('Cafe Model', () => {
  it('should create a valid Cafe object', () => {
    const cafe: Cafe = {
      id: 1,
      name: 'Blue Bottle Coffee',
      address: '東京都渋谷区神宮前4-1-1',
      lat: 35.6580,
      lng: 139.7016,
      visitDate: new Date('2024-01-15'),
      rating: 5,
      memo: '落ち着いた雰囲気で美味しいコーヒー',
      tags: ['WiFi', '電源あり'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(cafe.name).toBe('Blue Bottle Coffee');
    expect(cafe.rating).toBe(5);
    expect(cafe.lat).toBe(35.6580);
    expect(cafe.lng).toBe(139.7016);
  });

  it('should allow optional id for new cafes', () => {
    const newCafe: Omit<Cafe, 'id'> & { id?: number } = {
      name: 'Starbucks Reserve',
      address: '東京都目黒区中目黒1-1-1',
      lat: 35.6470,
      lng: 139.6993,
      visitDate: new Date(),
      rating: 4,
      memo: '広々とした空間',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(newCafe.id).toBeUndefined();
    expect(newCafe.name).toBe('Starbucks Reserve');
  });

  it('should allow optional tags', () => {
    const cafeWithoutTags: Cafe = {
      id: 2,
      name: 'ドトールコーヒー',
      address: '東京都新宿区新宿3-1-1',
      lat: 35.6896,
      lng: 139.7006,
      visitDate: new Date(),
      rating: 3,
      memo: '駅から近くて便利',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    expect(cafeWithoutTags.tags).toBeUndefined();
  });

  it('should validate rating range', () => {
    const isValidRating = (rating: number): boolean => {
      return rating >= 1 && rating <= 5;
    };

    expect(isValidRating(5)).toBe(true);
    expect(isValidRating(1)).toBe(true);
    expect(isValidRating(0)).toBe(false);
    expect(isValidRating(6)).toBe(false);
  });
});