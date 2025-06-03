import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'; // Para animações do PrimeNG
import {
  provideHttpClient,
  withInterceptorsFromDi,
} from '@angular/common/http'; // Para chamadas API
import Aura from '@primeng/themes/aura';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideAnimations(), // Adicionar para animações
    provideHttpClient(withInterceptorsFromDi()), // Adicionar para serviços HTTP
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
  ],
};
