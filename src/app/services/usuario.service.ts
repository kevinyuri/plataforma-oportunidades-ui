import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../enviroments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UsuarioService {
  // Usar a apiUrl do ficheiro de ambiente e adicionar o segmento /Usuarios
  private apiUrlBase = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Envia os dados de registo para o endpoint /registrar do backend.
   * @param usuarioData Os dados do utilizador para registo.
   * @returns Observable com a resposta do backend.
   */
  registrarUsuario(usuarioData: any): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrlBase}/Usuarios/registrar`, usuarioData)
      .pipe(catchError(this.handleError));
  }

  /**
   * Envia as credenciais de login para o endpoint /login do backend.
   * @param credentials As credenciais do utilizador (email e senha).
   * @returns Observable com a resposta do backend (espera-se token, expiração e dados do utilizador).
   */
  loginUsuario(credentials: { email: string; senha: string }): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrlBase}/Usuarios/login`, credentials)
      .pipe(catchError(this.handleError));
  }

  /**
   * Manipulador de erros para chamadas HTTP.
   * Tenta extrair uma mensagem de erro útil da resposta do backend.
   * @param error A HttpErrorResponse recebida.
   * @returns Um Observable que emite um Erro com a mensagem formatada.
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage =
      'Ocorreu um erro desconhecido ao processar a sua solicitação!';

    if (error.error instanceof ErrorEvent) {
      // Erro do lado do cliente ou de rede.
      errorMessage = `Erro de cliente: ${error.error.message}`;
    } else {
      // O backend retornou um código de resposta sem sucesso.
      // O corpo da resposta pode conter pistas sobre o que deu errado.
      console.error(
        `Backend retornou código ${error.status}, ` +
          `corpo do erro era: ${JSON.stringify(error.error)}`
      );

      if (error.status === 400) {
        // BadRequest
        if (error.error && error.error.errors) {
          // Erros de validação do ASP.NET Core ModelState
          const validationErrors = error.error.errors;
          let messages = [];
          for (const key in validationErrors) {
            if (validationErrors.hasOwnProperty(key)) {
              messages.push(validationErrors[key].join(' '));
            }
          }
          errorMessage = `Erro de validação: ${messages.join(' ')}`;
        } else if (error.error && error.error.message) {
          // Mensagem customizada de BadRequest (ex: email já em uso)
          errorMessage = error.error.message;
        } else if (
          typeof error.error === 'string' &&
          error.error.length < 200
        ) {
          // Mensagem de erro simples como string
          errorMessage = error.error;
        } else {
          errorMessage = `Erro ${error.status}: Solicitação inválida. Verifique os dados enviados.`;
        }
      } else if (error.status === 401 && error.error && error.error.message) {
        // Unauthorized com mensagem customizada
        errorMessage = error.error.message;
      } else if (error.status === 401) {
        // Unauthorized genérico
        errorMessage = 'Credenciais inválidas ou não autorizado.';
      } else if (error.status === 500 && error.error && error.error.message) {
        // Internal Server Error com mensagem customizada
        errorMessage = error.error.message;
      } else if (error.status === 500) {
        errorMessage =
          'Erro interno do servidor. Por favor, tente novamente mais tarde.';
      } else if (error.message) {
        errorMessage = error.message; // Fallback para a mensagem de erro HTTP genérica
      }
    }
    // Logar o erro para depuração
    console.error(
      'Erro detectado pelo handleError:',
      error,
      'Mensagem formatada para o utilizador:',
      errorMessage
    );
    // Retornar um objeto Error para que possa ser capturado com error.message no subscribe do componente
    return throwError(() => new Error(errorMessage));
  }
}
