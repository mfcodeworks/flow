import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { RouteReuseStrategy } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material/material.module';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ZoomService } from './services/zoom/zoom.service';
import { ThemeService } from './services/theme/theme.service';
import { CacheService } from './services/cache/cache.service';
import { NotificationService } from './services/notification/notification.service';
import { environment } from '../environments/environment';
import { NetworkService } from './services/network/network.service';
import { SharedModule } from './shared/shared.module';
import { AuthService } from './services/auth/auth.service';
import { BalanceService } from './services/balance/balance.service';
import { TransactionsService } from './services/transactions/transactions.service';
import { SourcesService } from './services/sources/sources.service';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';

@NgModule({
    imports: [
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireMessagingModule,
        BrowserModule,
        BrowserAnimationsModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        HttpClientModule,
        MaterialModule,
        SharedModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
    ],
    declarations: [
        AppComponent
    ],
    providers: [
        SplashScreen,
        BarcodeScanner,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
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
    bootstrap: [AppComponent]
})
export class AppModule {}