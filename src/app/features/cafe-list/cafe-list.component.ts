import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cafe-list',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="cafe-list-container">
      <h1>カフェ一覧</h1>
      <a routerLink="/cafes/new" class="add-button">新規追加</a>
      <p>登録されたカフェがここに表示されます</p>
    </div>
  `,
  styles: [`
    .cafe-list-container {
      padding: 20px;
    }
    .add-button {
      display: inline-block;
      padding: 8px 16px;
      background: #6F4E37;
      color: white;
      text-decoration: none;
      border-radius: 4px;
      margin: 10px 0;
    }
    .add-button:hover {
      background: #8B6F47;
    }
  `]
})
export class CafeListComponent {}