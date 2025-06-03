import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, MainLayoutComponent], // Adicione MainLayoutComponent aqui
  template: ` <router-outlet></router-outlet> `,
  // styleUrls: ['./app.component.scss'] // Se tiver estilos globais aqui
})
export class AppComponent {
  title = 'plataforma-oportunidades-ui';
}
