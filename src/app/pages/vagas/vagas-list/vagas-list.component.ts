import { Component, OnInit, OnDestroy } from '@angular/core'; // Adicionado OnDestroy
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { InscricoesService } from '../../../services/inscricoes.service';
import { Vaga } from '../../../models/vaga.model';
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
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // Para confirmação de exclusão
import { ConfirmationService } from 'primeng/api'; // Para confirmação de exclusão
import { TextareaModule } from 'primeng/textarea';
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
  ],
  templateUrl: './vagas-list.component.html',
  styleUrls: ['./vagas-list.component.scss'],
  providers: [MessageService, ConfirmationService],
})
export class VagasListComponent implements OnInit, OnDestroy {
  vagas: Vaga[] = [];
  isLoading: boolean = true;
  errorMessage: string | null = null;

  // Propriedades do modal de inscrição foram removidas

  displayCriarVagaModal: boolean = false;
  criarVagaForm!: FormGroup;
  isSubmittingCriarVaga: boolean = false;
  tiposContrato: any[];

  currentUser: any = null;
  private userSubscription!: Subscription;

  isEditModeVaga: boolean = false;
  vagaParaEditarId: string | null = null;
  isSubmittingInscricaoVaga: boolean = false; // Para o loading do botão de inscrição direta

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
      { label: 'Outro', value: 'Outro' },
    ];
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
    });

    this.carregarVagas();

    // Formulário de inscrição foi removido, pois a inscrição será direta

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

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  get canManageVagas(): boolean {
    return (
      this.currentUser &&
      (this.currentUser.perfil === 'empresa' ||
        this.currentUser.perfil === 'admin')
    );
  }

  // Verifica se o utilizador atual pode se inscrever em vagas (ex: não é empresa)
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
        this.errorMessage =
          err.message || 'Não foi possível carregar as vagas.';
        this.isLoading = false;
      },
    });
  }

  // Lógica para Modal de Inscrição REMOVIDA (abrirModalInscricao, fecharModalInscricao, onSubmitInscricao)

  // Nova lógica para Inscrição Direta
  realizarInscricao(vagaId: string): void {
    if (!this.currentUser || !this.currentUser.id) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Atenção',
        detail: 'Você precisa estar logado para se inscrever.',
      });
      // Opcional: redirecionar para o login
      // this.router.navigate(['/auth/login']);
      return;
    }

    if (!this.canInscribeInVagas) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Ação não permitida',
        detail:
          'Utilizadores com perfil de empresa não podem se inscrever em vagas.',
      });
      return;
    }

    this.isSubmittingInscricaoVaga = true; // Ativa o loading do botão específico (se tiver um)

    const dadosInscricao = {
      usuarioId: this.currentUser.id,
      vagaId: vagaId,
      cursoId: null, // Inscrição é para uma vaga
      status: 'Pendente', // Status padrão
    };

    this.inscricoesService.criarInscricao(dadosInscricao).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Inscrição na vaga realizada com sucesso!',
        });
        this.isSubmittingInscricaoVaga = false;
        // Opcional: atualizar estado da vaga para indicar que o utilizador está inscrito,
        // ou desabilitar o botão de inscrição para esta vaga.
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro na Inscrição',
          detail:
            err.message || 'Não foi possível realizar a inscrição na vaga.',
        });
        this.isSubmittingInscricaoVaga = false;
      },
    });
  }

  abrirModalCriarVaga(vaga?: Vaga): void {
    this.isEditModeVaga = !!vaga;
    this.criarVagaForm.reset();

    if (this.isEditModeVaga && vaga) {
      this.vagaParaEditarId = vaga.id;
      this.criarVagaForm.patchValue({
        titulo: vaga.titulo,
        descricao: vaga.descricao,
        empresa: vaga.empresa,
        local: vaga.local,
        tipoContrato: vaga.tipoContrato,
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
        detail:
          'Por favor, preencha todos os campos obrigatórios corretamente.',
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
              summary: 'Sucesso',
              detail: 'Vaga atualizada com sucesso!',
            });
            this.fecharModalCriarVaga();
            this.carregarVagas();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Erro',
              detail: err.message || 'Não foi possível atualizar a vaga.',
            });
            this.isSubmittingCriarVaga = false;
          },
        });
    } else {
      this.vagasService.criarVaga(vagaData).subscribe({
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
  }

  confirmarDelecaoVaga(vagaId: string): void {
    if (!this.canManageVagas) return;

    this.confirmationService.confirm({
      message:
        'Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita.',
      header: 'Confirmar Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sim, excluir',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.deletarVaga(vagaId);
      },
      // reject: () => { // Opcional: mensagem se cancelar
      //     this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'A exclusão da vaga foi cancelada.' });
      // }
    });
  }

  private deletarVaga(vagaId: string): void {
    this.isLoading = true;
    this.vagasService.deletarVaga(vagaId).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Sucesso',
          detail: 'Vaga excluída com sucesso!',
        });
        this.carregarVagas();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Erro ao Excluir',
          detail: err.message || 'Não foi possível excluir a vaga.',
        });
        this.isLoading = false;
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

  // fInscricao getter removido
  get fCriarVaga() {
    return this.criarVagaForm.controls;
  }
}
