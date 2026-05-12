import { Injectable } from '@angular/core';

import { AuthResponse } from '../models/auth.models';

const STORAGE_KEY = 'crm.auth';

@Injectable({ providedIn: 'root' })
export class TokenStorage {
  read(): AuthResponse | null {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    try {
      const parsed = JSON.parse(raw) as AuthResponse;
      if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
        this.clear();
        return null;
      }
      return parsed;
    } catch {
      this.clear();
      return null;
    }
  }

  write(value: AuthResponse): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  }

  clear(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}
