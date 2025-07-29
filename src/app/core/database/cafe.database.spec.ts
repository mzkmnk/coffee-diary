import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import 'fake-indexeddb/auto';
import { CafeDatabase } from './cafe.database';
import type { Cafe } from '../models/cafe.model';

describe('CafeDatabase', () => {
  let db: CafeDatabase;

  beforeEach(() => {
    db = new CafeDatabase();
  });

  afterEach(async () => {
    await db.delete();
  });

  it('should create database instance', () => {
    expect(db).toBeDefined();
    expect(db.name).toBe('CafeDiaryDB');
  });

  it('should have cafes table', () => {
    expect(db.cafes).toBeDefined();
  });

  it('should add a new cafe', async () => {
    const newCafe: Omit<Cafe, 'id'> = {
      name: 'Test Cafe',
      address: '東京都渋谷区1-1-1',
      lat: 35.6580,
      lng: 139.7016,
      visitDate: new Date(),
      rating: 4,
      memo: 'テスト用カフェ',
      tags: ['test'],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const id = await db.cafes.add(newCafe);
    expect(id).toBeGreaterThan(0);

    const cafe = await db.cafes.get(id);
    expect(cafe).toBeDefined();
    expect(cafe?.name).toBe('Test Cafe');
  });

  it('should get all cafes', async () => {
    const cafes: Omit<Cafe, 'id'>[] = [
      {
        name: 'Cafe 1',
        address: '東京都渋谷区1-1-1',
        lat: 35.6580,
        lng: 139.7016,
        visitDate: new Date(),
        rating: 5,
        memo: 'カフェ1',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Cafe 2',
        address: '東京都新宿区2-2-2',
        lat: 35.6896,
        lng: 139.7006,
        visitDate: new Date(),
        rating: 3,
        memo: 'カフェ2',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.cafes.bulkAdd(cafes);
    const allCafes = await db.cafes.toArray();
    
    expect(allCafes).toHaveLength(2);
    expect(allCafes[0].name).toBe('Cafe 1');
    expect(allCafes[1].name).toBe('Cafe 2');
  });

  it('should update a cafe', async () => {
    const cafe: Omit<Cafe, 'id'> = {
      name: 'Original Name',
      address: '東京都渋谷区1-1-1',
      lat: 35.6580,
      lng: 139.7016,
      visitDate: new Date(),
      rating: 3,
      memo: '元のメモ',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const id = await db.cafes.add(cafe);
    await db.cafes.update(id, { name: 'Updated Name', rating: 5 });

    const updatedCafe = await db.cafes.get(id);
    expect(updatedCafe?.name).toBe('Updated Name');
    expect(updatedCafe?.rating).toBe(5);
  });

  it('should delete a cafe', async () => {
    const cafe: Omit<Cafe, 'id'> = {
      name: 'To Be Deleted',
      address: '東京都渋谷区1-1-1',
      lat: 35.6580,
      lng: 139.7016,
      visitDate: new Date(),
      rating: 3,
      memo: '削除予定',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const id = await db.cafes.add(cafe);
    await db.cafes.delete(id);

    const deletedCafe = await db.cafes.get(id);
    expect(deletedCafe).toBeUndefined();
  });

  it('should search cafes by rating', async () => {
    const cafes: Omit<Cafe, 'id'>[] = [
      {
        name: 'High Rated Cafe',
        address: '東京都渋谷区1-1-1',
        lat: 35.6580,
        lng: 139.7016,
        visitDate: new Date(),
        rating: 5,
        memo: '高評価',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        name: 'Low Rated Cafe',
        address: '東京都新宿区2-2-2',
        lat: 35.6896,
        lng: 139.7006,
        visitDate: new Date(),
        rating: 2,
        memo: '低評価',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    await db.cafes.bulkAdd(cafes);
    const highRatedCafes = await db.cafes.where('rating').aboveOrEqual(4).toArray();
    
    expect(highRatedCafes).toHaveLength(1);
    expect(highRatedCafes[0].name).toBe('High Rated Cafe');
  });
});