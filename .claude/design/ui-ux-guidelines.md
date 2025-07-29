# UI/UXデザインガイドライン

## デザインコンセプト
**「温かみのあるカフェ体験の記録」**
- カフェの雰囲気を反映した温かみのあるデザイン
- 直感的で使いやすいインターフェース
- 写真や思い出を大切にする設計

## カラーパレット

### メインカラー
```scss
// プライマリカラー
$coffee-brown: #6F4E37;      // メインのコーヒーブラウン
$coffee-light: #8B6F47;      // ライトブラウン（ホバー時）
$coffee-dark: #5D3A1A;       // ダークブラウン（アクティブ時）

// セカンダリカラー
$cream: #FFF8DC;             // クリーム色（背景）
$latte: #F5DEB3;             // ラテ色（サブ背景）
$chocolate: #D2691E;         // チョコレート（アクセント）

// ニュートラルカラー
$gray-900: #212529;          // テキスト
$gray-700: #495057;          // サブテキスト
$gray-400: #CED4DA;          // ボーダー
$gray-100: #F8F9FA;          // 背景

// セマンティックカラー
$success: #28A745;           // 成功
$warning: #FFC107;           // 警告
$danger: #DC3545;            // エラー
$info: #17A2B8;              // 情報
```

## タイポグラフィ

### フォントファミリー
```scss
$font-primary: 'Noto Sans JP', -apple-system, BlinkMacSystemFont, sans-serif;
$font-display: 'Kiwi Maru', serif;  // ロゴや見出し用

// フォントサイズ
$font-size-base: 16px;
$font-size-sm: 14px;
$font-size-lg: 18px;
$font-size-h1: 32px;
$font-size-h2: 24px;
$font-size-h3: 20px;
```

## レイアウト原則

### 1. モバイルファースト
```scss
// ブレークポイント
$breakpoint-sm: 576px;
$breakpoint-md: 768px;
$breakpoint-lg: 992px;
$breakpoint-xl: 1200px;

// グリッドシステム
.container {
  padding: 0 16px;
  margin: 0 auto;
  
  @media (min-width: $breakpoint-md) {
    padding: 0 24px;
    max-width: 1200px;
  }
}
```

### 2. スペーシング
```scss
$spacing-unit: 8px;
$spacing-xs: $spacing-unit * 0.5;   // 4px
$spacing-sm: $spacing-unit;         // 8px
$spacing-md: $spacing-unit * 2;     // 16px
$spacing-lg: $spacing-unit * 3;     // 24px
$spacing-xl: $spacing-unit * 4;     // 32px
```

## コンポーネントデザイン

### 1. カフェカード
```scss
.cafe-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  }
  
  .cafe-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .cafe-content {
    padding: $spacing-md;
  }
  
  .cafe-rating {
    color: $chocolate;
    font-size: 18px;
  }
}
```

### 2. フォーム要素
```scss
.form-control {
  width: 100%;
  padding: 12px 16px;
  border: 2px solid $gray-400;
  border-radius: 8px;
  font-size: $font-size-base;
  transition: all 0.2s;
  
  &:focus {
    outline: none;
    border-color: $coffee-brown;
    box-shadow: 0 0 0 3px rgba(111, 78, 55, 0.1);
  }
  
  &.error {
    border-color: $danger;
  }
}

.btn {
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
  
  &-primary {
    background: $coffee-brown;
    color: white;
    
    &:hover {
      background: $coffee-light;
    }
  }
  
  &-secondary {
    background: $latte;
    color: $coffee-dark;
  }
}
```

### 3. 地図UI
```scss
.map-container {
  position: relative;
  height: 100vh;
  background: $cream;
  
  .map-controls {
    position: absolute;
    top: $spacing-md;
    right: $spacing-md;
    display: flex;
    flex-direction: column;
    gap: $spacing-sm;
    
    .control-btn {
      width: 40px;
      height: 40px;
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      
      &:hover {
        background: $gray-100;
      }
    }
  }
  
  .cafe-marker {
    width: 32px;
    height: 32px;
    background: $coffee-brown;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    cursor: pointer;
    transition: all 0.2s;
    
    &:hover {
      transform: rotate(-45deg) scale(1.2);
    }
    
    &::after {
      content: '';
      position: absolute;
      width: 12px;
      height: 12px;
      background: white;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
  }
}
```

## アニメーション

### 1. 基本的なトランジション
```scss
// イージング関数
$ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
$ease-in-out-quad: cubic-bezier(0.455, 0.03, 0.515, 0.955);

// 共通トランジション
@mixin transition-base {
  transition: all 0.3s $ease-out-expo;
}

// フェードイン
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// スケルトンローディング
@keyframes skeleton {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton {
  background: linear-gradient(
    90deg,
    $gray-100 25%,
    $gray-400 50%,
    $gray-100 75%
  );
  background-size: 200px 100%;
  animation: skeleton 1.5s infinite;
}
```

### 2. マイクロインタラクション
```scss
// ボタンクリック
.btn {
  &:active {
    transform: scale(0.95);
  }
}

// カード出現
.cafe-card {
  animation: fadeIn 0.5s $ease-out-expo;
  animation-fill-mode: both;
  
  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{$i * 0.05}s;
    }
  }
}

// レーティング星
.rating-star {
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.2);
    color: $chocolate;
  }
}
```

## アクセシビリティ

### 1. フォーカススタイル
```scss
*:focus-visible {
  outline: 3px solid $coffee-brown;
  outline-offset: 2px;
}

// キーボードナビゲーション時のみ表示
.focus-visible:focus:not(:focus-visible) {
  outline: none;
}
```

### 2. コントラスト比
- 通常テキスト: 4.5:1以上
- 大きいテキスト: 3:1以上
- UIコンポーネント: 3:1以上

### 3. タッチターゲット
- 最小サイズ: 44x44px
- 推奨サイズ: 48x48px
- 間隔: 最低8px

## レスポンシブデザイン

### モバイル（〜767px）
- シングルカラムレイアウト
- フルスクリーン地図
- ボトムナビゲーション
- スワイプ操作対応

### タブレット（768px〜991px）
- 2カラムグリッド
- サイドバーナビゲーション
- 地図とリストの分割表示

### デスクトップ（992px〜）
- 3-4カラムグリッド
- 地図メインビュー
- ホバーエフェクト有効
- キーボードショートカット

## パフォーマンス考慮

### 1. 画像最適化
```html
<!-- レスポンシブ画像 -->
<picture>
  <source media="(max-width: 768px)" srcset="cafe-mobile.webp">
  <source media="(min-width: 769px)" srcset="cafe-desktop.webp">
  <img src="cafe-fallback.jpg" alt="カフェの写真" loading="lazy">
</picture>
```

### 2. Critical CSS
```scss
// インライン化する重要なスタイル
.app-header { /* ... */ }
.loading-screen { /* ... */ }
.cafe-card { /* ... */ }
```

### 3. アニメーション最適化
```scss
// GPU加速を利用
.animated-element {
  will-change: transform;
  transform: translateZ(0);
}

// reduced-motionへの配慮
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```