import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // Se precisar fazer chamadas diretas, mas geralmente o UsuarioService faz
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { environment } from '../../enviroments/environment.development';
import { UsuarioService } from '../services/usuario.service';

// Chaves para o localStorage
const TOKEN_KEY = 'plataforma-auth-token';
const USER_KEY = 'plataforma-auth-user';
const EXPIRATION_KEY = 'plataforma-auth-token-expiration';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;
  private loginApiUrl = `${environment.apiUrl}/Usuarios/login`;

  constructor(
    private usuarioService: UsuarioService,
    private router: Router,
    private http: HttpClient
  ) {
    const storedUser = localStorage.getItem(USER_KEY);
    this.currentUserSubject = new BehaviorSubject<any>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    // Pode ser User
    return this.currentUserSubject.value;
  }

  login(credentials: { email: string; senha: string }): Observable<any> {
    // Resposta pode ser tipada
    return this.usuarioService.loginUsuario(credentials).pipe(
      tap((response) => {
        if (
          response &&
          response.token &&
          response.usuario &&
          response.expiration
        ) {
          this.setSession(response);
          this.currentUserSubject.next(response.usuario);
        } else {
          // Lançar erro se a resposta não for o esperado
          console.error('Resposta de login inválida do servidor:', response);
          throw new Error('Resposta de login inválida.');
        }
      }),
      catchError((error) => {
        // O erro já é tratado no UsuarioService, mas podemos logar ou transformar aqui
        console.error('AuthService: Erro durante o login', error);
        return throwError(() => error); // Re-lança o erro para o componente tratar
      })
    );
  }

  private setSession(authResult: {
    token: string;
    expiration: string;
    usuario: any;
  }): void {
    localStorage.setItem(TOKEN_KEY, authResult.token);
    localStorage.setItem(USER_KEY, JSON.stringify(authResult.usuario));
    localStorage.setItem(EXPIRATION_KEY, authResult.expiration); // A expiração já vem como string ISO
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(EXPIRATION_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/auth/login']); // Redireciona para a página de login
  }

  public getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  public isAuthenticated(): boolean {
    const token = this.getToken();
    const expiration = localStorage.getItem(EXPIRATION_KEY);

    if (!token || !expiration) {
      return false;
    }

    try {
      // A data de expiração do token JWT geralmente é uma string ISO 8601 ou um timestamp Unix.
      // O backend está a retornar 'token.ValidTo' que é um DateTime.
      const expirationDate = new Date(expiration);
      return expirationDate.getTime() > new Date().getTime();
    } catch (e) {
      console.error('Erro ao analisar data de expiração do token:', e);
      this.logout(); // Se houver erro, deslogar por segurança
      return false;
    }
  }

  // Opcional: método para renovar token, se o backend suportar refresh tokens
}
