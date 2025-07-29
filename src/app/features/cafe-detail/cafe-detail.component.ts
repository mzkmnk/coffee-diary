import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cafe-detail',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="cafe-detail-container">
      <h1>カフェ詳細</h1>
      <p>カフェの詳細情報がここに表示されます</p>
      <div class="actions">
        <a routerLink="/cafes" class="back-link">一覧に戻る</a>
        <a routerLink="edit" class="edit-link">編集</a>
      </div>
    </div>
  `,
  styles: [`
    .cafe-detail-container {
      padding: 20px;
    }
    .actions {
      margin-top: 20px;
      display: flex;
      gap: 20px;
    }
    .back-link, .edit-link {
      color: #6F4E37;
    }
  `]
})
export class CafeDetailComponent {}