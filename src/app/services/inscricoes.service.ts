import { Injectable } from '@angular/core';
import {
  HttpClient,
  HttpErrorResponse,
  HttpParams,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../enviroments/environment.development';

// Opcional: Defina interfaces para os DTOs de Inscrição

@Injectable({
  providedIn: 'root',
})
export class InscricoesService {
  private apiUrl = `${environment.apiUrl}/Inscricoes`;

  constructor(private http: HttpClient) {}

  // GET: /api/Inscricoes
  getInscricoes(filtros?: {
    usuarioId?: string;
    vagaId?: string;
    cursoId?: string;
  }): Observable<any[]> {
    let params = new HttpParams();
    if (filtros) {
      if (filtros.usuarioId) {
        params = params.append('usuarioId', filtros.usuarioId);
      }
      if (filtros.vagaId) {
        params = params.append('vagaId', filtros.vagaId);
      }
      if (filtros.cursoId) {
        params = params.append('cursoId', filtros.cursoId);
      }
    }
    return this.http
      .get<any[]>(this.apiUrl, { params })
      .pipe(catchError(this.handleError));
  }

  // GET: /api/Inscricoes/{id}
  getInscricaoPorId(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // POST: /api/Inscricoes
  criarInscricao(inscricaoData: any): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, inscricaoData)
      .pipe(catchError(this.handleError));
  }

  // PUT: /api/Inscricoes/{id}
  atualizarInscricao(id: string, inscricaoUpdateData: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, inscricaoUpdateData)
      .pipe(catchError(this.handleError));
  }

  // DELETE: /api/Inscricoes/{id}
  deletarInscricao(id: string): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido!';
    // ... (Lógica de tratamento de erro similar à do UsuarioService/VagasService) ...
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erro de cliente: ${error.error.message}`;
    } else {
      console.error(
        `Backend retornou código ${error.status}, corpo:`,
        error.error
      );
      if (error.status === 400 && error.error) {
        if (error.error.errors) {
          const validationErrors = error.error.errors;
          let messages = [];
          for (const key in validationErrors) {
            if (validationErrors.hasOwnProperty(key)) {
              messages.push(validationErrors[key].join(' '));
            }
          }
          errorMessage = `Erro de validação: ${messages.join(' ')}`;
        } else if (error.error.message) {
          // Mensagem customizada de BadRequest
          errorMessage = error.error.message;
        } else if (
          typeof error.error === 'string' &&
          error.error.length < 200
        ) {
          errorMessage = error.error;
        } else {
          errorMessage = `Erro ${error.status}: Solicitação inválida.`;
        }
      } else if (error.status === 401) {
        errorMessage = 'Não autorizado.';
      } else if (error.status === 404) {
        errorMessage = 'Recurso não encontrado.';
      } else if (error.status === 500) {
        errorMessage = 'Erro interno do servidor.';
      } else if (error.message) {
        errorMessage = error.message;
      }
    }
    return throwError(() => new Error(errorMessage));
  }
}
