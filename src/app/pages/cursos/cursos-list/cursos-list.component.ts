import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { InscricoesService } from '../../../services/inscricoes.service';
import { Curso } from '../../../models/curso.model';

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
import { TextareaModule } from 'primeng/textarea';
import { CursosService } from '../../../services/curso.service';

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
  ],
  templateUrl: './cursos-list.component.html',
  styleUrls: ['./cursos-list.component.scss'],
  providers: [MessageService],
})
export class CursosListComponent implements OnInit {
  cursos: Curso[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Para o modal de Inscrição no Curso
  displayInscricaoCursoModal: boolean = false;
  inscricaoCursoForm!: FormGroup;
  selectedCursoId: string | null = null;
  isSubmittingInscricaoCurso: boolean = false;

  // Para o modal de Criar Curso
  displayCriarCursoModal: boolean = false;
  criarCursoForm!: FormGroup;
  isSubmittingCriarCurso: boolean = false;
  modalidadesCurso: any[];

  constructor(
    private cursosService: CursosService,
    private inscricoesService: InscricoesService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.modalidadesCurso = [
      { label: 'Online', value: 'Online' },
      { label: 'Presencial', value: 'Presencial' },
      { label: 'Híbrido', value: 'Híbrido' },
      { label: 'Outro', value: 'Outro' },
    ];
  }

  ngOnInit(): void {
    this.carregarCursos();

    this.inscricaoCursoForm = this.fb.group({
      usuarioId: ['', [Validators.required, Validators.minLength(3)]],
    });

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

  // --- Lógica para Modal de Inscrição no Curso ---
  abrirModalInscricaoCurso(cursoId: string): void {
    this.selectedCursoId = cursoId;
    this.inscricaoCursoForm.reset();
    this.displayInscricaoCursoModal = true;
  }

  fecharModalInscricaoCurso(): void {
    this.displayInscricaoCursoModal = false;
    this.selectedCursoId = null;
    this.isSubmittingInscricaoCurso = false;
  }

  onSubmitInscricaoCurso(): void {
    if (this.inscricaoCursoForm.invalid || !this.selectedCursoId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha o ID do Usuário.',
      });
      Object.values(this.inscricaoCursoForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }
    this.isSubmittingInscricaoCurso = true;
    const dadosInscricao = {
      usuarioId: this.inscricaoCursoForm.value.usuarioId,
      vagaId: null, // Inscrição é para um curso
      cursoId: this.selectedCursoId,
      status: 'Inscrito', // Status padrão para inscrição em curso
    };
    this.inscricoesService.criarInscricao(dadosInscricao).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Inscrição no curso realizada com sucesso!',
        });
        this.fecharModalInscricaoCurso();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail:
            err.message || 'Não foi possível realizar a inscrição no curso.',
        });
        this.isSubmittingInscricaoCurso = false;
      },
    });
  }

  // --- Lógica para Modal de Criar Curso ---
  abrirModalCriarCurso(): void {
    this.criarCursoForm.reset();
    this.displayCriarCursoModal = true;
  }

  fecharModalCriarCurso(): void {
    this.displayCriarCursoModal = false;
    this.isSubmittingCriarCurso = false;
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
    const novoCursoData = this.criarCursoForm.value;

    this.cursosService.criarCurso(novoCursoData).subscribe({
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

  // Função para obter a severidade da tag com base na modalidade (exemplo)
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

  get fInscricaoCurso() {
    return this.inscricaoCursoForm.controls;
  }
  get fCriarCurso() {
    return this.criarCursoForm.controls;
  }
}
