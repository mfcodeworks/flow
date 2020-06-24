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
import { BalanceService } from './services/balance/balance.service';
import { AuthService } from './services/auth/auth.service';
import { TransactionsService } from './services/transactions/transactions.service';
import { SourcesService } from './services/sources/sources.service';

@NgModule({
    imports: [
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireMessagingModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: true }) //{ enabled: environment.production })
    ],
    providers: [
        StatusBar,
        SplashScreen,
        {
            provide: APP_INITIALIZER,
            useFactory: (
                z: ZoomService,
                t: ThemeService,
                c: CacheService,
                n: NotificationService,
                net: NetworkService,
                a: AuthService,
                b: BalanceService,
                tr: TransactionsService,
                s: SourcesService
            ) => () => Promise.all([
                net.init(),
                c.init(),
                z.init(),
                t.init(),
                n.init(),
                a.init(),
                b.init(),
                tr.init(),
                s.init(),
            ]),
            deps: [
                ZoomService,
                ThemeService,
                CacheService,
                NotificationService,
                NetworkService,
                AuthService,
                BalanceService,
                TransactionsService,
                SourcesService
            ],
            multi: true
        }
    ],
})
export class CoreModule {}
