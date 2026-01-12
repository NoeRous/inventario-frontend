import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { FilterMatchMode } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    providePrimeNG({
            theme: {
                preset: Aura,
                options: {
                    prefix: 'p',
                    //darkModeSelector: 'system',
                    cssLayer: false,
                    darkModeSelector: false
                }
            },
            ripple: true,
            overlayAppendTo: 'body',
            zIndex: {
              modal: 1100,    // dialog, sidebar
              overlay: 1000,  // dropdown, overlaypanel
              menu: 1000,     // overlay menus
              tooltip: 1100   // tooltip
            },
            filterMatchModeOptions: {
              text: [FilterMatchMode.STARTS_WITH, FilterMatchMode.CONTAINS, FilterMatchMode.NOT_CONTAINS, FilterMatchMode.ENDS_WITH, FilterMatchMode.EQUALS, FilterMatchMode.NOT_EQUALS],
              numeric: [FilterMatchMode.EQUALS, FilterMatchMode.NOT_EQUALS, FilterMatchMode.LESS_THAN, FilterMatchMode.LESS_THAN_OR_EQUAL_TO, FilterMatchMode.GREATER_THAN, FilterMatchMode.GREATER_THAN_OR_EQUAL_TO],
              date: [FilterMatchMode.DATE_IS, FilterMatchMode.DATE_IS_NOT, FilterMatchMode.DATE_BEFORE, FilterMatchMode.DATE_AFTER]
            },
            translation: {
              accept: 'Aceptar',
              reject: 'Rechazar',
              //translations
            }
        })
  ]
};
