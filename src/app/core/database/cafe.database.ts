import Dexie, { Table } from 'dexie';
import type { Cafe } from '../models/cafe.model';

export class CafeDatabase extends Dexie {
  cafes!: Table<Cafe>;

  constructor() {
    super('CafeDiaryDB');
    
    this.version(1).stores({
      cafes: '++id, name, visitDate, rating, [lat+lng]'
    });
  }
}