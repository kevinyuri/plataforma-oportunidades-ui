import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { InscricoesService } from '../../../services/inscricoes.service';
import { Vaga } from '../../../models/vaga.model';
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
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox'; // IMPORTANTE: Módulo adicionado
import { TooltipModule } from 'primeng/tooltip'; // Adicionado para os tooltips
import { VagasService } from '../../../services/vaga.service';
import { AuthService } from '../../../auth/auth.service';

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
    InputTextModule,
    TextareaModule,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
    CheckboxModule, // Adicionado
    TooltipModule   // Adicionado
  ],
  templateUrl: './vagas-list.component.html',
  styleUrls: ['./vagas-list.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class VagasListComponent implements OnInit, OnDestroy {
  vagas: Vaga[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  displayCriarVagaModal: boolean = false;
  criarVagaForm!: FormGroup;
  isSubmittingCriarVaga: boolean = false;

  tiposContrato: any[];
  zonasDaCidade: string[]; // Lista para o Dropdown

  currentUser: any = null;
  private userSubscription!: Subscription;

  isEditModeVaga: boolean = false;
  vagaParaEditarId: string | null = null;
  isSubmittingInscricaoVaga: boolean = false;

  constructor(
    private vagasService: VagasService,
    private inscricoesService: InscricoesService,
    private authService: AuthService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.tiposContrato = [
      { label: 'CLT', value: 'CLT' },
      { label: 'PJ (Pessoa Jurídica)', value: 'PJ' },
      { label: 'Estágio', value: 'Estágio' },
      { label: 'Temporário', value: 'Temporário' },
      { label: 'Freelance', value: 'Freelance' },
      { label: 'Voluntariado', value: 'Voluntariado' }, // Bom para ODS
    ];

    // Zonas da cidade para facilitar o filtro
    this.zonasDaCidade = [
        'Zona Norte', 'Zona Sul', 'Zona Leste', 'Zona Oeste', 'Centro', 'Região Metropolitana'
    ];
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
    });

    this.carregarVagas();

    // Inicializa o formulário com os novos campos ODS 11
    this.criarVagaForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(150)]],
      descricao: ['', [Validators.required, Validators.minLength(10)]],
      empresa: ['', [Validators.maxLength(100)]],

      // Novos campos
      bairro: ['', [Validators.maxLength(100)]], // Importante para localidade
      zonaDaCidade: [null],
      local: ['Fortaleza', [Validators.maxLength(100)]], // Default
      ehVagaVerde: [false], // Checkbox
      aceitaRemoto: [false], // Checkbox

      tipoContrato: [null],
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  get canManageVagas(): boolean {
    return (
      this.currentUser &&
      (this.currentUser.perfil === 'empresa' || this.currentUser.perfil === 'admin')
    );
  }

  get canInscribeInVagas(): boolean {
    return this.currentUser && this.currentUser.perfil !== 'empresa';
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
        this.errorMessage = err.message || 'Não foi possível carregar as vagas.';
        this.isLoading = false;
      },
    });
  }

  realizarInscricao(vagaId: string): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Você precisa estar logado para se inscrever.',
      });
      return;
    }

    if (!this.canInscribeInVagas) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ação não permitida',
        detail: 'Utilizadores com perfil de empresa não podem se inscrever em vagas.',
      });
      return;
    }

    this.isSubmittingInscricaoVaga = true;

    const dadosInscricao = {
      usuarioId: this.currentUser.id,
      vagaId: vagaId,
      cursoId: null,
      status: 'Pendente',
    };

    this.inscricoesService.criarInscricao(dadosInscricao).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Inscrição Realizada!',
          detail: 'Boa sorte! A empresa analisará seu perfil.',
        });
        this.isSubmittingInscricaoVaga = false;
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro na Inscrição',
          detail: err.message || 'Não foi possível realizar a inscrição.',
        });
        this.isSubmittingInscricaoVaga = false;
      },
    });
  }

  abrirModalCriarVaga(vaga?: Vaga): void {
    this.isEditModeVaga = !!vaga;
    this.criarVagaForm.reset({
        local: 'Fortaleza',
        ehVagaVerde: false,
        aceitaRemoto: false
    });

    if (this.isEditModeVaga && vaga) {
      this.vagaParaEditarId = vaga.id;
      // Popula o formulário com dados existentes (incluindo os novos)
      this.criarVagaForm.patchValue({
        titulo: vaga.titulo,
        descricao: vaga.descricao,
        empresa: vaga.empresa,
        local: vaga.local,
        tipoContrato: vaga.tipoContrato,
        // Novos campos (Se existirem no objeto vaga)
        bairro: (vaga as any).bairro,
        zonaDaCidade: (vaga as any).zonaDaCidade,
        ehVagaVerde: (vaga as any).ehVagaVerde,
        aceitaRemoto: (vaga as any).aceitaRemoto
      });
    } else {
      this.vagaParaEditarId = null;
    }
    this.displayCriarVagaModal = true;
  }

  fecharModalCriarVaga(): void {
    this.displayCriarVagaModal = false;
    this.isSubmittingCriarVaga = false;
    this.isEditModeVaga = false;
    this.vagaParaEditarId = null;
  }

  onSubmitCriarVaga(): void {
    if (this.criarVagaForm.invalid) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Preencha os campos obrigatórios.',
      });
      Object.values(this.criarVagaForm.controls).forEach((control) =>
        control.markAsTouched()
      );
      return;
    }
    this.isSubmittingCriarVaga = true;
    const vagaData = this.criarVagaForm.value;

    if (this.isEditModeVaga && this.vagaParaEditarId) {
      this.vagasService
        .atualizarVaga(this.vagaParaEditarId, vagaData)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Atualizado',
              detail: 'Vaga atualizada com sucesso!',
            });
            this.fecharModalCriarVaga();
            this.carregarVagas();
          },
          error: (err) => {
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao atualizar.' });
            this.isSubmittingCriarVaga = false;
          },
        });
    } else {
      this.vagasService.criarVaga(vagaData).subscribe({
        next: (vagaCriada) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Publicada',
            detail: 'Nova oportunidade criada!',
          });
          this.fecharModalCriarVaga();
          this.carregarVagas();
        },
        error: (err) => {
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao criar vaga.' });
          this.isSubmittingCriarVaga = false;
        },
      });
    }
  }

  confirmarDelecaoVaga(vagaId: string): void {
    if (!this.canManageVagas) return;

    this.confirmationService.confirm({
      message: 'Tem certeza que deseja excluir esta vaga? A ação é irreversível.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Excluir',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.deletarVaga(vagaId);
      },
    });
  }

  private deletarVaga(vagaId: string): void {
    this.isLoading = true;
    this.vagasService.deletarVaga(vagaId).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Vaga removida.' });
        this.carregarVagas();
      },
      error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Não foi possível excluir.' });
        this.isLoading = false;
      },
    });
  }

  getSeverityForTipoContrato(tipoContrato?: string): string {
    if (!tipoContrato) return 'info';
    const tipo = tipoContrato.toLowerCase();
    if (tipo.includes('clt') || tipo.includes('efetivo')) return 'success';
    if (tipo.includes('pj')) return 'warning';
    if (tipo.includes('estágio')) return 'info';
    return 'primary';
  }

  get fCriarVaga() {
    return this.criarVagaForm.controls;
  }
}
