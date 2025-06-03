import { Routes } from '@angular/router';
import { VagasListComponent } from './pages/vagas/vagas-list/vagas-list.component';
import { CursosListComponent } from './pages/cursos/cursos-list/cursos-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/vagas', pathMatch: 'full' }, // Redireciona para vagas como página inicial
  { path: 'vagas', component: VagasListComponent, title: 'Vagas de Emprego' },
  {
    path: 'cursos',
    component: CursosListComponent,
    title: 'Cursos de Capacitação',
  },
];
