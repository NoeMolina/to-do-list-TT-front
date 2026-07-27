import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthResponse, LoginRequest, RegisterRequest } from '../models/user.model';

interface DecodedToken {
  sub: string;
  userId: number;
  role: string;
  exp: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private readonly tokenKey = 'auth_token';

  private readonly _token = signal<string | null>(this.readStoredToken());
  private readonly _username = signal<string | null>(null);
  private readonly _userId = signal<number | null>(null);
  private readonly _role = signal<string | null>(null);

  readonly token = this._token.asReadonly();
  readonly username = this._username.asReadonly();
  readonly userId = this._userId.asReadonly();
  readonly isAuthenticated = computed(() => this._token() !== null);
  readonly isAdmin = computed(() => this._role() === 'ADMIN');

  constructor(private http: HttpClient) {
    const stored = this.readStoredToken();
    if (stored) {
      this.hydrateFromToken(stored);
    }
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap((response) => this.setSession(response.token))
    );
  }

  register(request: RegisterRequest): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/register`, request);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this._token.set(null);
    this._username.set(null);
    this._userId.set(null);
    this._role.set(null);
  }

  private setSession(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this._token.set(token);
    this.hydrateFromToken(token);
  }

  private hydrateFromToken(token: string): void {
    const decoded = this.decodeToken(token);
    if (!decoded) {
      this.logout();
      return;
    }
    this._username.set(decoded.sub);
    this._userId.set(decoded.userId);
    this._role.set(decoded.role);
  }

  private decodeToken(token: string): DecodedToken | null {
    try {
      const payload = token.split('.')[1];
      const decoded = JSON.parse(atob(payload)) as DecodedToken;

      if (decoded.exp * 1000 < Date.now()) {
        return null; // token expirado
      }
      return decoded;
    } catch {
      return null;
    }
  }

  private readStoredToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }
}