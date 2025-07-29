import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cafe-form',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="cafe-form-container">
      <h1>カフェ登録</h1>
      <p>カフェ登録フォームがここに表示されます</p>
      <a routerLink="/cafes" class="back-link">一覧に戻る</a>
    </div>
  `,
  styles: [`
    .cafe-form-container {
      padding: 20px;
    }
    .back-link {
      display: inline-block;
      margin-top: 20px;
      color: #6F4E37;
    }
  `]
})
export class CafeFormComponent {}