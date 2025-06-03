import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // RouterModule para routerLink
import { MessageService } from 'primeng/api';

// Importações do PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast'; // Para notificações
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule, // Adicionar para routerLink
    CardModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    ToastModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  providers: [MessageService], // Fornecer MessageService aqui ou globalmente
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  submitted = false;
  isLoading = false; // Para feedback no botão de login

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService
  ) {
    // Se o utilizador já estiver autenticado, redirecionar para a página principal
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/']); // Ajuste para a rota principal/dashboard do Sakai
    }
  }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.loginForm.markAllAsTouched(); // Mostrar erros de validação se houver

    if (this.loginForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha o e-mail e a senha corretamente.',
      });
      return;
    }

    this.isLoading = true;
    const credentials = this.loginForm.value;

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Login realizado com sucesso!',
        });
        // Redirecionar para a página principal ou dashboard após o login
        // A rota '/' é comum para o dashboard no Sakai ou a página que o AuthGuard tentou aceder
        const returnUrl =
          this.router.routerState.snapshot.root.queryParams['returnUrl'] || '/';
        this.router.navigateByUrl(returnUrl);
      },
      error: (errorResponse) => {
        this.isLoading = false;
        console.error('Erro no login (componente):', errorResponse);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro no Login',
          detail:
            errorResponse.message ||
            'Credenciais inválidas ou erro no servidor.',
        });
      },
    });
  }
}
