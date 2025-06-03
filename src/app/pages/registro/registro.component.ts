import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router'; // RouterModule para routerLink
import { MessageService } from 'primeng/api';

// Importações do PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast'; // Para notificações
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule, // Adicionado para p-password [(ngModel)] se usado com feedback complexo, mas tentaremos com formControlName
    RouterModule, // Adicionar para routerLink
    CardModule,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
  ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
  providers: [MessageService], // Fornecer MessageService aqui ou globalmente
})
export class RegistroComponent implements OnInit {
  registroForm!: FormGroup;
  submitted = false;
  isLoading = false; // Para feedback no botão de registo
  perfis: any[]; // Para o dropdown de perfis

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.perfis = [
      { label: 'Candidato', value: 'candidato' },
      { label: 'Empresa', value: 'empresa' },
      // Não incluir 'admin' aqui, pois o registo de admin deve ser um processo separado
    ];
  }

  ngOnInit(): void {
    this.registroForm = this.fb.group(
      {
        nome: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ],
        ],
        email: [
          '',
          [Validators.required, Validators.email, Validators.maxLength(100)],
        ],
        senha: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(100),
            // Validators.pattern(this.strongRegex) // Descomente para usar a validação de senha forte
          ],
        ],
        confirmarSenha: ['', Validators.required],
        perfil: [null, Validators.required], // Perfil default ou deixar utilizador escolher
        telefone: ['', [Validators.maxLength(20)]], // Opcional
      },
      { validators: this.passwordMatchValidator }
    );
  }

  // Validador customizado para verificar se as senhas coincidem
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const senha = control.get('senha');
    const confirmarSenha = control.get('confirmarSenha');

    if (senha && confirmarSenha && senha.value !== confirmarSenha.value) {
      confirmarSenha.setErrors({ mismatch: true }); // Define erro no campo confirmarSenha
      return { mismatch: true }; // Retorna erro para o FormGroup
    } else if (confirmarSenha && confirmarSenha.hasError('mismatch')) {
      // Se as senhas agora coincidem, mas o erro 'mismatch' ainda está lá, limpe-o.
      confirmarSenha.setErrors(null);
    }
    return null; // Sem erro
  }

  get f() {
    return this.registroForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.registroForm.markAllAsTouched(); // Garante que as mensagens de erro apareçam

    if (this.registroForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail:
          'Por favor, preencha todos os campos obrigatórios corretamente.',
      });
      return;
    }

    this.isLoading = true;
    // Remover confirmarSenha do objeto a ser enviado para o backend, pois não faz parte do UsuarioCreateDto
    const { confirmarSenha, ...dadosUsuarioParaApi } = this.registroForm.value;

    this.usuarioService.registrarUsuario(dadosUsuarioParaApi).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Utilizador registado com sucesso! Por favor, faça login.',
        });
        // Adicionar um pequeno delay antes de redirecionar para o utilizador ver a mensagem
        setTimeout(() => {
          this.router.navigate(['/auth/login']); // Redirecionar para a página de login
        }, 2000);
      },
      error: (errorResponse) => {
        this.isLoading = false;
        console.error('Erro no registo (componente):', errorResponse);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro no Registo',
          detail:
            errorResponse.message ||
            'Não foi possível registar o utilizador. Verifique os dados ou tente mais tarde.',
        });
      },
    });
  }
}
