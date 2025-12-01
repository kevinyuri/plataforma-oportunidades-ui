import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { InscricoesService } from '../../../services/inscricoes.service';
import { Curso } from '../../../models/curso.model';
import { Subscription } from 'rxjs';

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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox'; // IMPORTANTE: Adicionado
import { TooltipModule } from 'primeng/tooltip'; // IMPORTANTE: Adicionado
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
    ConfirmDialogModule,
    CheckboxModule, // Adicionado
    TooltipModule, // Adicionado
  ],
  templateUrl: './cursos-list.component.html',
  styleUrls: ['./cursos-list.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class CursosListComponent implements OnInit, OnDestroy {
  cursos: Curso[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  displayCriarCursoModal: boolean = false;
  criarCursoForm!: FormGroup;
  isSubmittingCriarCurso: boolean = false;
  modalidadesCurso: any[];

  currentUser: any = null;
  private userSubscription!: Subscription;

  isEditModeCurso: boolean = false;
  cursoParaEditarId: string | null = null;
  isSubmittingInscricaoCurso: boolean = false;

  constructor(
    private cursosService: CursosService,
    private inscricoesService: InscricoesService,
    private authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.modalidadesCurso = [
      { label: 'Online', value: 'Online' },
      { label: 'Presencial', value: 'Presencial' },
      { label: 'Híbrido', value: 'Híbrido' },
      { label: 'Oficina Prática', value: 'Oficina' }, // Bom para ODS 11
    ];
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
    });

    this.carregarCursos();

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

      // --- NOVOS CAMPOS ODS 11 ---
      focadoEmSustentabilidade: [false], // Checkbox
      impactoComunitario: ['', [Validators.maxLength(200)]], // Descrição curta
      // ---------------------------
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  get canManageCursos(): boolean {
    return (
      this.currentUser &&
      (this.currentUser.perfil === 'admin' ||
        this.currentUser.perfil === 'empresa')
    );
  }

  get canInscribeInCursos(): boolean {
    return !!this.currentUser;
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

  realizarInscricaoCurso(cursoId: string): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Você precisa estar logado para se inscrever.',
      });
      return;
    }

    this.isSubmittingInscricaoCurso = true;

    const dadosInscricao = {
      usuarioId: this.currentUser.id,
      vagaId: null,
      cursoId: cursoId,
      status: 'Inscrito',
    };

    this.inscricoesService.criarInscricao(dadosInscricao).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Inscrito!',
          detail: 'Você garantiu sua vaga no curso.',
        });
        this.isSubmittingInscricaoCurso = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err.message || 'Erro na inscrição.',
        });
        this.isSubmittingInscricaoCurso = false;
      },
    });
  }

  abrirModalCriarCurso(curso?: Curso): void {
    this.isEditModeCurso = !!curso;
    this.criarCursoForm.reset({
      focadoEmSustentabilidade: false,
    });

    if (this.isEditModeCurso && curso) {
      this.cursoParaEditarId = curso.id;
      this.criarCursoForm.patchValue({
        nome: curso.nome,
        instituicao: curso.instituicao,
        cargaHoraria: curso.cargaHoraria,
        modalidade: curso.modalidade,
        dataInicio: curso.dataInicio ? new Date(curso.dataInicio) : null,

        // Novos campos (cast any se a interface ainda não tiver atualizado no front)
        focadoEmSustentabilidade: (curso as any).focadoEmSustentabilidade,
        impactoComunitario: (curso as any).impactoComunitario,
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
        detail: 'Preencha os campos obrigatórios.',
      });
      Object.values(this.criarCursoForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }
    this.isSubmittingCriarCurso = true;
    const cursoData = this.criarCursoForm.value;

    if (this.isEditModeCurso && this.cursoParaEditarId) {
      this.cursosService
        .atualizarCurso(this.cursoParaEditarId, cursoData)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Atualizado',
              detail: 'Curso atualizado com sucesso!',
            });
            this.fecharModalCriarCurso();
            this.carregarCursos();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: 'Erro ao atualizar.',
            });
            this.isSubmittingCriarCurso = false;
          },
        });
    } else {
      this.cursosService.criarCurso(cursoData).subscribe({
        next: (cursoCriado) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Criado',
            detail: `Curso criado com sucesso!`,
          });
          this.fecharModalCriarCurso();
          this.carregarCursos();
        },
        error: (err) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao criar curso.',
          });
          this.isSubmittingCriarCurso = false;
        },
      });
    }
  }

  confirmarDelecaoCurso(cursoId: string): void {
    if (!this.canManageCursos) return;

    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir este curso?',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
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
          detail: 'Curso removido.',
        });
        this.carregarCursos();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: 'Erro ao excluir.',
        });
        this.isLoading = false;
      },
    });
  }

  getSeverityForModalidade(modalidade?: string): string {
    if (!modalidade) return 'info';
    const mod = modalidade.toLowerCase();
    if (mod === 'online') return 'success';
    if (mod === 'híbrido') return 'warning';
    if (mod === 'presencial' || mod === 'oficina') return 'info';
    return 'secondary';
  }

  get fCriarCurso() {
    return this.criarCursoForm.controls;
  }
}
