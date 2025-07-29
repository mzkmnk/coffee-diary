import { Injectable } from '@angular/core';
import { CafeDatabase } from '../database/cafe.database';
import type { Cafe } from '../models/cafe.model';

export interface SearchCriteria {
  name?: string;
  minRating?: number;
  tags?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class CafeStorageService {
  private db: CafeDatabase;

  constructor() {
    this.db = new CafeDatabase();
  }

  async addCafe(cafe: Omit<Cafe, 'id' | 'createdAt' | 'updatedAt'>): Promise<number> {
    if (cafe.rating < 1 || cafe.rating > 5) {
      throw new Error('Rating must be between 1 and 5');
    }

    const now = new Date();
    const newCafe = {
      ...cafe,
      createdAt: now,
      updatedAt: now
    };

    return await this.db.cafes.add(newCafe as Cafe);
  }

  async getAllCafes(): Promise<Cafe[]> {
    return await this.db.cafes.toArray();
  }

  async getCafeById(id: number): Promise<Cafe | undefined> {
    return await this.db.cafes.get(id);
  }

  async updateCafe(id: number, updates: Partial<Omit<Cafe, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    if (updates.rating !== undefined && (updates.rating < 1 || updates.rating > 5)) {
      throw new Error('Rating must be between 1 and 5');
    }

    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    await this.db.cafes.update(id, updateData);
  }

  async deleteCafe(id: number): Promise<void> {
    await this.db.cafes.delete(id);
  }

  async searchCafes(criteria: SearchCriteria): Promise<Cafe[]> {
    let cafes = await this.db.cafes.toArray();

    if (criteria.name) {
      cafes = cafes.filter(cafe => 
        cafe.name.toLowerCase().includes(criteria.name!.toLowerCase())
      );
    }

    if (criteria.minRating !== undefined) {
      cafes = cafes.filter(cafe => cafe.rating >= criteria.minRating!);
    }

    if (criteria.tags && criteria.tags.length > 0) {
      cafes = cafes.filter(cafe => 
        cafe.tags && criteria.tags!.some(tag => cafe.tags!.includes(tag))
      );
    }

    return cafes;
  }

  async getCafesByArea(minLat: number, maxLat: number, minLng: number, maxLng: number): Promise<Cafe[]> {
    const cafes = await this.db.cafes.toArray();
    return cafes.filter(cafe => 
      cafe.lat >= minLat && 
      cafe.lat <= maxLat && 
      cafe.lng >= minLng && 
      cafe.lng <= maxLng
    );
  }

  async clearAll(): Promise<void> {
    await this.db.cafes.clear();
  }
}