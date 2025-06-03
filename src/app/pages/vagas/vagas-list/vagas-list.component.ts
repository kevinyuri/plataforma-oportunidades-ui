import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { InscricoesService } from '../../../services/inscricoes.service';
import { Vaga } from '../../../models/vaga.model';

// Importações do PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageModule } from 'primeng/message';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown'; // Para TipoContrato, se aplicável
import { ToastModule } from 'primeng/toast';
import { TextareaModule } from 'primeng/textarea';
import { MessageService } from 'primeng/api';
import { VagasService } from '../../../services/vaga.service';

@Component({
  selector: 'app-vagas-list',
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
    TextareaModule,
    InputTextModule, // Adicionar
    DropdownModule, // Adicionar
    ToastModule,
  ],
  templateUrl: './vagas-list.component.html',
  styleUrls: ['./vagas-list.component.scss'],
  providers: [MessageService],
})
export class VagasListComponent implements OnInit {
  vagas: Vaga[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Para o modal de Inscrição
  displayInscricaoModal: boolean = false;
  inscricaoForm!: FormGroup;
  selectedVagaId: string | null = null;
  isSubmittingInscricao: boolean = false;

  // Para o modal de Criar Vaga
  displayCriarVagaModal: boolean = false;
  criarVagaForm!: FormGroup;
  isSubmittingCriarVaga: boolean = false;
  tiposContrato: any[];

  constructor(
    private vagasService: VagasService,
    private inscricoesService: InscricoesService,
    private fb: FormBuilder,
    private messageService: MessageService
  ) {
    this.tiposContrato = [
      { label: 'CLT', value: 'CLT' },
      { label: 'PJ (Pessoa Jurídica)', value: 'PJ' },
      { label: 'Estágio', value: 'Estágio' },
      { label: 'Temporário', value: 'Temporário' },
      { label: 'Freelance', value: 'Freelance' },
      { label: 'Outro', value: 'Outro' },
    ];
  }

  ngOnInit(): void {
    this.carregarVagas();

    this.inscricaoForm = this.fb.group({
      usuarioId: ['', [Validators.required, Validators.minLength(3)]],
    });

    // Inicializar o formulário de Criar Vaga
    this.criarVagaForm = this.fb.group({
      titulo: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(150),
        ],
      ],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      empresa: ['', [Validators.maxLength(100)]],
      local: ['', [Validators.maxLength(100)]],
      tipoContrato: [null],
    });
  }

  carregarVagas(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.vagasService.getVagas().subscribe({
      next: (data) => {
        this.vagas = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.errorMessage =
          err.message || 'Não foi possível carregar as vagas.';
        this.isLoading = false;
      },
    });
  }

  // --- Lógica para Modal de Inscrição ---
  abrirModalInscricao(vagaId: string): void {
    this.selectedVagaId = vagaId;
    this.inscricaoForm.reset();
    this.displayInscricaoModal = true;
  }

  fecharModalInscricao(): void {
    this.displayInscricaoModal = false;
    this.selectedVagaId = null;
    this.isSubmittingInscricao = false;
  }

  onSubmitInscricao(): void {
    if (this.inscricaoForm.invalid || !this.selectedVagaId) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Por favor, preencha o ID do Usuário.',
      });
      Object.values(this.inscricaoForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }
    this.isSubmittingInscricao = true;
    const dadosInscricao = {
      usuarioId: this.inscricaoForm.value.usuarioId,
      vagaId: this.selectedVagaId,
      cursoId: null,
      status: 'Pendente',
    };
    this.inscricoesService.criarInscricao(dadosInscricao).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Inscrição realizada com sucesso!',
        });
        this.fecharModalInscricao();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err.message || 'Não foi possível realizar a inscrição.',
        });
        this.isSubmittingInscricao = false;
      },
    });
  }

  // --- Lógica para Modal de Criar Vaga ---
  abrirModalCriarVaga(): void {
    this.criarVagaForm.reset();
    this.displayCriarVagaModal = true;
  }

  fecharModalCriarVaga(): void {
    this.displayCriarVagaModal = false;
    this.isSubmittingCriarVaga = false;
  }

  onSubmitCriarVaga(): void {
    if (this.criarVagaForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail:
          'Por favor, preencha todos os campos obrigatórios corretamente.',
      });
      Object.values(this.criarVagaForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }
    this.isSubmittingCriarVaga = true;
    const novaVagaData = this.criarVagaForm.value;

    this.vagasService.criarVaga(novaVagaData).subscribe({
      next: (vagaCriada) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: `Vaga "${vagaCriada.titulo}" criada com sucesso!`,
        });
        this.fecharModalCriarVaga();
        this.carregarVagas();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro',
          detail: err.message || 'Não foi possível criar a vaga.',
        });
        this.isSubmittingCriarVaga = false;
      },
    });
  }

  getSeverityForTipoContrato(tipoContrato?: string): string {
    if (!tipoContrato) return 'info';
    switch (tipoContrato.toLowerCase()) {
      case 'clt':
      case 'efetivo':
        return 'success';
      case 'pj':
      case 'pessoa jurídica':
        return 'warning';
      case 'estágio':
        return 'info';
      case 'temporário':
        return 'primary';
      default:
        return 'secondary';
    }
  }

  get fInscricao() {
    return this.inscricaoForm.controls;
  }
  get fCriarVaga() {
    return this.criarVagaForm.controls;
  }
}
