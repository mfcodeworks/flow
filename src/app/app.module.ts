import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { MaterialModule } from './material/material.module';
import { CoreModule } from './core.module';
import { JwtInterceptor } from './shared/interceptors/jwt.interceptor';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

@NgModule({
    declarations: [AppComponent],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        IonicModule.forRoot(),
        CoreModule
        AppRoutingModule,
        HttpClientModule,
        MaterialModule,
    ],
    providers: [        
        { 
            provide: HTTP_INTERCEPTORS, 
            useClass: JwtInterceptor, 
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule {}
