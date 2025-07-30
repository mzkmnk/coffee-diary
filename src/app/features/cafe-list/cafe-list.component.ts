import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CafeStorageService } from '../../core/services/cafe-storage.service';
import { Cafe } from '../../core/models/cafe.model';

@Component({
  selector: 'app-cafe-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './cafe-list.component.html',
  styleUrl: './cafe-list.component.css'
})
export class CafeListComponent implements OnInit {
  private cafeStorage = inject(CafeStorageService);
  
  cafes: Cafe[] = [];
  filteredCafes: Cafe[] = [];
  isLoading = true;
  searchTerm = '';
  sortOrder: 'asc' | 'desc' = 'desc';
  showFilters = false;
  activeFilters: string[] = [];

  ngOnInit() {
    this.loadCafes();
  }

  async loadCafes() {
    this.isLoading = true;
    try {
      this.cafes = await this.cafeStorage.getAllCafes();
      this.applyFiltersAndSort();
    } catch (error) {
      console.error('カフェデータの読み込みに失敗:', error);
    } finally {
      this.isLoading = false;
    }
  }

  onSearch() {
    this.applyFiltersAndSort();
  }

  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
    this.applyFiltersAndSort();
  }

  toggleFilters() {
    this.showFilters = !this.showFilters;
  }

  closeFilters() {
    this.showFilters = false;
  }

  removeFilter(filter: string) {
    this.activeFilters = this.activeFilters.filter(f => f !== filter);
    this.applyFiltersAndSort();
  }

  private applyFiltersAndSort() {
    let filtered = [...this.cafes];

    // Search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(cafe => 
        cafe.name.toLowerCase().includes(term) ||
        cafe.address.toLowerCase().includes(term) ||
        (cafe.memo && cafe.memo.toLowerCase().includes(term))
      );
    }

    // Apply other filters
    this.activeFilters.forEach(filter => {
      // Filter logic would go here
    });

    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.visitDate).getTime();
      const dateB = new Date(b.visitDate).getTime();
      return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    });

    this.filteredCafes = filtered;
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
  }

  getStars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  }

  getGenreLabel(genre: string): string {
    const genreMap: { [key: string]: string } = {
      coffee: 'コーヒー専門店',
      chain: 'チェーン店',
      local: '個人経営',
      specialty: 'スペシャルティ',
      tea: '紅茶・日本茶',
      other: 'その他'
    };
    return genreMap[genre] || genre;
  }

  getFilterLabel(filter: string): string {
    // Filter label logic
    return filter;
  }
}