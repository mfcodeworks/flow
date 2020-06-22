import { NgModule, APP_INITIALIZER } from '@angular/core';
import { AngularFireModule } from '@angular/fire';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { ServiceWorkerModule } from '@angular/service-worker';

import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

import { ZoomService } from './services/zoom/zoom.service';
import { ThemeService } from './services/theme/theme.service';
import { CacheService } from './services/cache/cache.service';
import { NotificationService } from './services/notification/notification.service';
import { environment } from '../environments/environment';
import { NetworkService } from './services/network/network.service';

@NgModule({
    imports: [
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireMessagingModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: true }) //{ enabled: environment.production })
    ],
    providers: [
        StatusBar,
        SplashScreen,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        {
            provide: APP_INITIALIZER,
            useFactory: (
                z: ZoomService,
                t: ThemeService,
                c: CacheService,
                n: NotificationService,
                net: NetworkService
            ) => () => {
                net.init();
                c.init();
                z.init();
                t.init();
                n.init();
            },
            deps: [
                ZoomService,
                ThemeService,
                CacheService,
                NotificationService,
                NetworkService
            ],
            multi: true
        }
    ],
})
export class CoreModule {}
