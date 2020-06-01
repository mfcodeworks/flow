import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { LongholdDirective } from './directives/longhold.directive';
import { RouteTransformerDirective } from './directives/route-transformer.directive';
import { TopBarComponent } from './components/top-bar/top-bar.component';
import { ZoomService } from '../services/zoom/zoom.service';
import { ThemeService } from '../services/theme/theme.service';
import { CacheService } from '../services/cache/cache.service';
import { NotificationService } from '../services/notification/notification.service';
import { NetworkService } from '../services/network/network.service';
import { AuthService } from '../services/auth/auth.service';
import { BalanceService } from '../services/balance/balance.service';
import { TransactionsService } from '../services/transactions/transactions.service';
import { SourcesService } from '../services/sources/sources.service';

@NgModule({
    imports: [
        CommonModule,
        IonicModule.forRoot()
    ],
    declarations: [
        LongholdDirective,
        RouteTransformerDirective,
        TopBarComponent
    ],
    providers: [
        SplashScreen,
        BarcodeScanner,
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
    exports: [
        LongholdDirective,
        RouteTransformerDirective,
        TopBarComponent
    ]
})
export class SharedModule {}
