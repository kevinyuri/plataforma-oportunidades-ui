import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-vagas-list',
  standalone: true,
  imports: [CommonModule, CardModule, ButtonModule],
  template: `
    <h2>Lista de Vagas</h2>
    <p-card
      header="Desenvolvedor Frontend Pleno"
      subheader="Empresa X (Remoto)"
      [style]="{ width: '360px' }"
    >
      <p>
        Oportunidade para desenvolvedor com experiência em Angular e PrimeNG.
      </p>
      <ng-template pTemplate="footer">
        <p-button label="Ver Detalhes" icon="pi pi-eye"></p-button>
        <p-button
          label="Inscrever-se"
          icon="pi pi-check"
          styleClass="p-button-success ml-2"
        ></p-button>
      </ng-template>
    </p-card>
  `,
  // styleUrls: ['./vagas-list.component.scss']
})
export class VagasListComponent {}
