import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, filter, take } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NetworkService {
  private onlineSubject: BehaviorSubject<boolean>;
  public online$: Observable<boolean>;

  constructor() {
    this.onlineSubject = new BehaviorSubject<boolean>(navigator.onLine);
    this.online$ = this.onlineSubject.asObservable();

    // ネットワークステータスの変更を監視
    window.addEventListener('online', () => this.updateOnlineStatus(true));
    window.addEventListener('offline', () => this.updateOnlineStatus(false));
  }

  private updateOnlineStatus(status: boolean): void {
    this.onlineSubject.next(status);
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  async checkConnection(): Promise<boolean> {
    if (!navigator.onLine) {
      return false;
    }

    try {
      // 実際の接続を確認するため、小さなリクエストを送信
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      return true;
    } catch {
      return false;
    }
  }

  async waitForConnection(): Promise<void> {
    if (this.isOnline()) {
      return;
    }

    return new Promise((resolve) => {
      this.online$
        .pipe(
          filter(status => status === true),
          take(1)
        )
        .subscribe(() => {
          resolve();
        });
    });
  }

  onStatusChange(callback: (status: boolean) => void): () => void {
    const subscription = this.online$.subscribe(callback);
    return () => subscription.unsubscribe();
  }
}