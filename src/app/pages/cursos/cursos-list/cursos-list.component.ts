import { Component, OnInit, OnDestroy } from '@angular/core'; // Adicionado OnDestroy
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { InscricoesService } from '../../../services/inscricoes.service';
import { Curso } from '../../../models/curso.model';
import { Subscription } from 'rxjs'; // Importar Subscription

// Importações do PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // Para confirmação de exclusão
import { ConfirmationService } from 'primeng/api'; // Para confirmação de exclusão
import { TextareaModule } from 'primeng/textarea';
import { CursosService } from '../../../services/curso.service';
import { AuthService } from '../../../auth/auth.service';

@Component({
  selector: 'app-cursos-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    ProgressSpinnerModule,
    MessageModule,
    TagModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    CalendarModule,
    ToastModule,
    ConfirmDialogModule, // Adicionar
  ],
  templateUrl: './cursos-list.component.html',
  styleUrls: ['./cursos-list.component.scss'],
  providers: [MessageService, ConfirmationService], // Adicionar ConfirmationService
})
export class CursosListComponent implements OnInit, OnDestroy {
  // Implementar OnDestroy
  cursos: Curso[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Propriedades do modal de inscrição em curso foram removidas

  displayCriarCursoModal: boolean = false;
  criarCursoForm!: FormGroup;
  isSubmittingCriarCurso: boolean = false;
  modalidadesCurso: any[];

  currentUser: any = null;
  private userSubscription!: Subscription;

  isEditModeCurso: boolean = false;
  cursoParaEditarId: string | null = null;
  isSubmittingInscricaoCurso: boolean = false; // Para o loading do botão de inscrição direta

  constructor(
    private cursosService: CursosService,
    private inscricoesService: InscricoesService,
    private authService: AuthService, // Injetar AuthService
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService // Injetar ConfirmationService
  ) {
    this.modalidadesCurso = [
      { label: 'Online', value: 'Online' },
      { label: 'Presencial', value: 'Presencial' },
      { label: 'Híbrido', value: 'Híbrido' },
      { label: 'Outro', value: 'Outro' },
    ];
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
    });

    this.carregarCursos();

    // Formulário de inscrição em curso foi removido

    this.criarCursoForm = this.fb.group({
      nome: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(150),
        ],
      ],
      instituicao: ['', [Validators.maxLength(100)]],
      cargaHoraria: ['', [Validators.maxLength(50)]],
      modalidade: [null],
      dataInicio: [null, Validators.required],
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  // Getter para verificar se o utilizador pode gerir cursos (criar, editar, deletar)
  // Ajuste os perfis conforme necessário (ex: apenas 'admin')
  get canManageCursos(): boolean {
    return (
      this.currentUser &&
      (this.currentUser.perfil === 'admin' ||
        this.currentUser.perfil === 'empresa')
    );
  }

  // Verifica se o utilizador atual pode se inscrever em cursos
  get canInscribeInCursos(): boolean {
    // Exemplo: todos os utilizadores logados podem se inscrever, exceto se houver outra regra
    return !!this.currentUser; // Ou uma lógica mais específica, ex: this.currentUser.perfil === 'candidato'
  }

  carregarCursos(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.cursosService.getCursos().subscribe({
      next: (data) => {
        this.cursos = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          err.message || 'Não foi possível carregar os cursos.';
        this.isLoading = false;
      },
    });
  }

  // Lógica para Modal de Inscrição REMOVIDA

  // Nova lógica para Inscrição Direta em Curso
  realizarInscricaoCurso(cursoId: string): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Você precisa estar logado para se inscrever.',
      });
      return;
    }

    if (!this.canInscribeInCursos) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ação não permitida',
        detail: 'Seu perfil não permite inscrição em cursos.',
      });
      return;
    }

    this.isSubmittingInscricaoCurso = true;

    const dadosInscricao = {
      usuarioId: this.currentUser.id,
      vagaId: null, // Inscrição é para um curso
      cursoId: cursoId,
      status: 'Inscrito', // Status padrão
    };

    this.inscricoesService.criarInscricao(dadosInscricao).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Inscrição no curso realizada com sucesso!',
        });
        this.isSubmittingInscricaoCurso = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro na Inscrição',
          detail:
            err.message || 'Não foi possível realizar a inscrição no curso.',
        });
        this.isSubmittingInscricaoCurso = false;
      },
    });
  }

  abrirModalCriarCurso(curso?: Curso): void {
    this.isEditModeCurso = !!curso;
    this.criarCursoForm.reset();

    if (this.isEditModeCurso && curso) {
      this.cursoParaEditarId = curso.id;
      this.criarCursoForm.patchValue({
        nome: curso.nome,
        instituicao: curso.instituicao,
        cargaHoraria: curso.cargaHoraria,
        modalidade: curso.modalidade,
        dataInicio: curso.dataInicio ? new Date(curso.dataInicio) : null, // Converter para objeto Date se necessário
      });
    } else {
      this.cursoParaEditarId = null;
    }
    this.displayCriarCursoModal = true;
  }

  fecharModalCriarCurso(): void {
    this.displayCriarCursoModal = false;
    this.isSubmittingCriarCurso = false;
    this.isEditModeCurso = false;
    this.cursoParaEditarId = null;
  }

  onSubmitCriarCurso(): void {
    if (this.criarCursoForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail:
          'Por favor, preencha todos os campos obrigatórios corretamente.',
      });
      Object.values(this.criarCursoForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }
    this.isSubmittingCriarCurso = true;
    const cursoData = this.criarCursoForm.value;

    if (this.isEditModeCurso && this.cursoParaEditarId) {
      // Lógica de Atualização
      this.cursosService
        .atualizarCurso(this.cursoParaEditarId, cursoData)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Curso atualizado com sucesso!',
            });
            this.fecharModalCriarCurso();
            this.carregarCursos();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: err.message || 'Não foi possível atualizar o curso.',
            });
            this.isSubmittingCriarCurso = false;
          },
        });
    } else {
      // Lógica de Criação
      this.cursosService.criarCurso(cursoData).subscribe({
        next: (cursoCriado) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Sucesso',
            detail: `Curso "${cursoCriado.nome}" criado com sucesso!`,
          });
          this.fecharModalCriarCurso();
          this.carregarCursos();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: err.message || 'Não foi possível criar o curso.',
          });
          this.isSubmittingCriarCurso = false;
        },
      });
    }
  }

  confirmarDelecaoCurso(cursoId: string): void {
    if (!this.canManageCursos) return;

    this.confirmationService.confirm({
      message:
        'Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.deletarCurso(cursoId);
      },
    });
  }

  private deletarCurso(cursoId: string): void {
    this.isLoading = true;
    this.cursosService.deletarCurso(cursoId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Curso excluído com sucesso!',
        });
        this.carregarCursos();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao Excluir',
          detail: err.message || 'Não foi possível excluir o curso.',
        });
        this.isLoading = false;
      },
    });
  }

  getSeverityForModalidade(modalidade?: string): string {
    if (!modalidade) return 'info';
    switch (modalidade.toLowerCase()) {
      case 'online':
        return 'success';
      case 'presencial':
        return 'info';
      case 'híbrido':
        return 'warning';
      default:
        return 'secondary';
    }
  }

  // fInscricaoCurso getter removido
  get fCriarCurso() {
    return this.criarCursoForm.controls;
  }
}
