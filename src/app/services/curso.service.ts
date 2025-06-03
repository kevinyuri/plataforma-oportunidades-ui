import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../enviroments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class CursosService {
  // Usar a apiUrl do ficheiro de ambiente
  private apiUrl = `${environment.apiUrl}/Cursos`;

  constructor(private http: HttpClient) {}

  // GET: /api/Cursos
  getCursos(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(catchError(this.handleError));
  }

  // GET: /api/Cursos/{id}
  getCursoPorId(id: string): Observable<any> {
    return this.http
      .get<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  // POST: /api/Cursos
  criarCurso(cursoData: any): Observable<any> {
    return this.http
      .post<any>(this.apiUrl, cursoData)
      .pipe(catchError(this.handleError));
  }

  // PUT: /api/Cursos/{id}
  atualizarCurso(id: string, cursoData: any): Observable<any> {
    return this.http
      .put<any>(`${this.apiUrl}/${id}`, cursoData)
      .pipe(catchError(this.handleError));
  }

  // DELETE: /api/Cursos/{id}
  deletarCurso(id: string): Observable<any> {
    return this.http
      .delete<any>(`${this.apiUrl}/${id}`)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Ocorreu um erro desconhecido!';
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
