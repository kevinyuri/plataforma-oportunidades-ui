import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component'; // Ajuste o caminho se o seu layout estiver noutro local
import { LoginComponent } from './pages/login/login.component';
import { authGuard } from './auth/auth.guard';
import { RegistroComponent } from './pages/registro/registro.component';

export const routes: Routes = [
  // Rotas de autenticação (públicas)
  // Estas rotas não devem usar o MainLayoutComponent se tiverem um layout diferente (o que é comum)
  {
    path: 'auth',
    children: [
      { path: 'login', component: LoginComponent, title: 'Login' },
      {
        path: 'registro',
        component: RegistroComponent,
        title: 'Registar Utilizador',
      },
      // { path: 'esqueci-senha', component: EsqueciSenhaComponent, title: 'Recuperar Senha'}, // Exemplo
      { path: '', redirectTo: 'login', pathMatch: 'full' }, // Redireciona /auth para /auth/login por defeito
    ],
  },

  {
    path: '', // Rota raiz para o conteúdo principal após o login
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'vagas',
        pathMatch: 'full',
      },
      {
        path: 'vagas',
        // Carregar o VagasListComponent (que é standalone)
        loadComponent: () =>
          import('./pages/vagas/vagas-list/vagas-list.component').then(
            (c) => c.VagasListComponent
          ),
        title: 'Vagas de Emprego',
      },
      {
        path: 'registro',
        component: RegistroComponent,
        title: 'Registar Utilizador',
      },
      {
        path: 'cursos',
        // Carregar o CursosListComponent (que é standalone)
        loadComponent: () =>
          import('./pages/cursos/cursos-list/cursos-list.component').then(
            (c) => c.CursosListComponent
          ),
        title: 'Cursos de Capacitação',
      },
    ],
  },

  { path: '**', redirectTo: '/login' }, // Ou para uma página 404 dedicada, se preferir
];
