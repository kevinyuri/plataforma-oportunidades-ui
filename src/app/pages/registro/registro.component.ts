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
import { Router, RouterModule } from '@angular/router';
import { MessageService } from 'primeng/api';

// Importações do PrimeNG
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-registro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    ButtonModule,
    ToastModule,
  ],
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss'],
  providers: [MessageService],
})
export class RegistroComponent implements OnInit {
  registroForm!: FormGroup;
  submitted = false;
  isLoading = false;
  perfis: any[];

  constructor(
    private fb: FormBuilder,
    private usuarioService: UsuarioService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.perfis = [
      { label: 'Candidato', value: 'candidato' },
      { label: 'Empresa', value: 'empresa' },
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

        // --- NOVO CAMPO ODS 11 ---
        // Obrigatório para garantir o funcionamento da lógica de vagas locais
        bairroResidencia: [
          '',
          [Validators.required, Validators.maxLength(100)],
        ],
        // -------------------------

        senha: [
          '',
          [
            Validators.required,
            Validators.minLength(6),
            Validators.maxLength(100),
          ],
        ],
        confirmarSenha: ['', Validators.required],
        perfil: [null, Validators.required],
        telefone: ['', [Validators.maxLength(20)]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const senha = control.get('senha');
    const confirmarSenha = control.get('confirmarSenha');

    if (senha && confirmarSenha && senha.value !== confirmarSenha.value) {
      confirmarSenha.setErrors({ mismatch: true });
      return { mismatch: true };
    } else if (confirmarSenha && confirmarSenha.hasError('mismatch')) {
      confirmarSenha.setErrors(null);
    }
    return null;
  }

  get f() {
    return this.registroForm.controls;
  }

  onSubmit(): void {
    this.submitted = true;
    this.registroForm.markAllAsTouched();

    if (this.registroForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha todos os campos obrigatórios.',
      });
      return;
    }

    this.isLoading = true;
    // Remove confirmarSenha antes de enviar
    const { confirmarSenha, ...dadosUsuarioParaApi } = this.registroForm.value;

    this.usuarioService.registrarUsuario(dadosUsuarioParaApi).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.messageService.add({
          severity: 'success',
          summary: 'Bem-vindo!',
          detail: 'Cadastro realizado com sucesso. Faça login para continuar.',
        });
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 2000);
      },
      error: (errorResponse) => {
        this.isLoading = false;
        console.error('Erro no registo:', errorResponse);
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: errorResponse.error?.message || 'Erro ao registrar usuário.',
        });
      },
    });
  }
}
