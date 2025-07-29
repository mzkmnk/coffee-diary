#!/usr/bin/env node

// Vercelビルド時に環境変数から設定を注入するスクリプト
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../src/environments/environment.prod.ts');

// Vercelの環境変数から取得
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';

if (!googleMapsApiKey) {
  console.warn('⚠️  警告: GOOGLE_MAPS_API_KEY が設定されていません');
}

const content = `export const environment = {
  production: true,
  googleMapsApiKey: '${googleMapsApiKey}'
};`;

fs.writeFileSync(envPath, content);
console.log('✅ environment.prod.ts が生成されました');