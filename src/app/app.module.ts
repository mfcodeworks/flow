import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AngularFireModule } from '@angular/fire';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { RouteReuseStrategy } from '@angular/router';
import { ServiceWorkerModule } from '@angular/service-worker';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material/material.module';
import { SharedModule } from './shared/shared.module';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { environment } from '../environments/environment';

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        IonicModule.forRoot(),
        AppRoutingModule,
        HttpClientModule,
        MaterialModule,
        SharedModule,
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireMessagingModule,
        ServiceWorkerModule.register('ngsw-worker.js', {enabled: environment.production})
    ],
    declarations: [
        AppComponent
    ],
    providers: [
        {provide: RouteReuseStrategy, useClass: IonicRouteStrategy},
        {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true}
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}