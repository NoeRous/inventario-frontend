import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'inventario_auth_token';

  isLoggedIn(): boolean {
    return !!localStorage.getItem(this.TOKEN_KEY);
  }

  login(username: string, password: string): boolean {
    // TODO: reemplazar por validación real contra tu API
    if (username && password) {
      localStorage.setItem(this.TOKEN_KEY, 'logged_in');
      return true;
    }

    return false;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }
}

