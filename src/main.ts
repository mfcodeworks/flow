import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
    enableProdMode();
}

console.log('Loading app');
platformBrowserDynamic().bootstrapModule(AppModule)
    .then(() => console.log('Bootstrapped'))
    .then(() => defineCustomElements(window))
    .catch(err => console.error);
