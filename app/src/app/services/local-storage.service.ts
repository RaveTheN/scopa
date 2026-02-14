import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalStorageService {
  private readonly prefix = 'scopa_ng_';

  save<T>(key: string, data: T): void {
    try {
      localStorage.setItem(this.buildKey(key), JSON.stringify(data));
    } catch {
      // Storage may be unavailable, fail silently.
    }
  }

  load<T>(key: string): T | null {
    try {
      const raw = localStorage.getItem(this.buildKey(key));
      if (!raw) {
        return null;
      }

      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  remove(key: string): void {
    try {
      localStorage.removeItem(this.buildKey(key));
    } catch {
      // Storage may be unavailable, fail silently.
    }
  }

  private buildKey(key: string): string {
    return `${this.prefix}${key}`;
  }
}
