import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf
import { Router, RouterModule } from '@angular/router'; // Para router-outlet e routerLink
import { ToolbarModule } from 'primeng/toolbar';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar'; // Opcional, para avatar do utilizador
import { Subscription } from 'rxjs';
import { AuthService } from '../../auth/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule, // Importar CommonModule
    RouterModule,
    ToolbarModule,
    ButtonModule,
    AvatarModule,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  currentUser: any = null; // Pode ser uma interface User
  private userSubscription!: Subscription;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.currentUser.subscribe((user) => {
      this.currentUser = user;
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
  }

  irParaPerfil(): void {
    // Navegar para a página de perfil do utilizador, se houver
    // this.router.navigate(['/perfil', this.currentUser?.id]);
    console.log('Navegar para o perfil do utilizador');
  }

  get isPerfilEmpresa(): boolean {
    return this.currentUser && this.currentUser.perfil === 'empresa';
  }
}
