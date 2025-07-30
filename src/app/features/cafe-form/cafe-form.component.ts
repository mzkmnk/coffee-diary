import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CafeStorageService } from '../../core/services/cafe-storage.service';
import { GeocodingService } from '../../core/services/geocoding.service';
import { Cafe } from '../../core/models/cafe.model';

@Component({
  selector: 'app-cafe-form',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  templateUrl: './cafe-form.component.html',
  styleUrl: './cafe-form.component.css'
})
export class CafeFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private cafeStorage = inject(CafeStorageService);
  private geocoding = inject(GeocodingService);

  cafeForm!: FormGroup;
  isSubmitting = false;
  isSearching = false;
  showSuccess = false;

  ngOnInit() {
    this.initializeForm();
  }

  private initializeForm() {
    this.cafeForm = this.fb.group({
      name: ['', Validators.required],
      address: ['', Validators.required],
      latitude: [null, Validators.required],
      longitude: [null, Validators.required],
      rating: [null, [Validators.required, Validators.min(1), Validators.max(5)]],
      genre: [''],
      notes: ['']
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.cafeForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  setRating(rating: number) {
    this.cafeForm.patchValue({ rating });
    this.cafeForm.get('rating')?.markAsTouched();
  }

  async searchAddress() {
    const address = this.cafeForm.get('address')?.value;
    if (!address) return;

    this.isSearching = true;
    try {
      const result = await this.geocoding.geocodeAddress(address);
      this.cafeForm.patchValue({
        latitude: result.lat,
        longitude: result.lng
      });
    } catch (error) {
      console.error('住所検索エラー:', error);
      alert('住所の検索に失敗しました。住所を確認してもう一度お試しください。');
    } finally {
      this.isSearching = false;
    }
  }

  async onSubmit() {
    if (this.cafeForm.invalid) {
      Object.keys(this.cafeForm.controls).forEach(key => {
        this.cafeForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    try {
      const formValue = this.cafeForm.value;
      const newCafe: Omit<Cafe, 'id'> = {
        ...formValue,
        visitDate: new Date().toISOString()
      };

      await this.cafeStorage.addCafe(newCafe);
      
      this.showSuccess = true;
      setTimeout(() => {
        this.showSuccess = false;
        this.router.navigate(['/cafes']);
      }, 2000);
    } catch (error) {
      console.error('カフェ登録エラー:', error);
      alert('カフェの登録に失敗しました。もう一度お試しください。');
    } finally {
      this.isSubmitting = false;
    }
  }
}