import { NgModule, APP_INITIALIZER } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { RouteReuseStrategy } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

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

@NgModule({
    declarations: [AppComponent],
    entryComponents: [],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireMessagingModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        HttpClientModule,
        MaterialModule,
        ServiceWorkerModule.register('ngsw-worker.js', { enabled: true }) //{ enabled: environment.production })
    ],
    providers: [
        StatusBar,
        SplashScreen,
        { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
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
    bootstrap: [AppComponent]
})
export class AppModule {}
