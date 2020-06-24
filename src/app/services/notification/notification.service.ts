import { Injectable } from '@angular/core';
import { PushService } from '../push/push.service';
import { AuthService } from '../auth/auth.service';
import { BackendService } from '../backend/backend.service';
import { filter, tap, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    // DEBUG: Subscribe topic

    constructor(
        private push: PushService,
        private auth: AuthService,
        private backend: BackendService
    ) {}

    // Init push services
    async init(): Promise<void> {
        // On new token, if token has value and user is logged in, save
        this.push.token.pipe(
            tap(token => console.log(`New FCM token ${token}`)),
            filter(token => !!token),
            filter(() => this.auth.loggedIn.value),
            switchMap(t => this.saveToken(t))
        ).subscribe();

        // On new login status, update token status
        this.auth.loggedIn.pipe(
            // If token has no value we can't proceed
            filter(() => !!this.push.token.value),
            // Make to backend call
            switchMap(l => l
                ? this.saveToken(this.push.token.value)
                : this.deleteToken(this.push.token.value)
            )
        ).subscribe();

        // Init push service
        this.push.init();
    }

    // Send to server to save token
    private saveToken(token: string): Observable<any> {
        console.log(`Saving Token: ${token}`);

        // Send token to server
        return this.backend.saveFcm(token).pipe(
            tap(_ => console.log(`Saved FCM ${token}`))
        );
    }

    // Send to server to delete token
    private deleteToken(token: string): Observable<any> {
        console.log(`Unsaving Token: ${token}`);

        // Send token to server
        return this.backend.deleteFcm(token).pipe(
            tap(_ => console.log(`Deleted FCM ${token}`))
        );
    }

    // Send to server to subscribe
    subscribe(topic: string, token: string): Observable<any> {
        console.log(`Subscribing topic: ${topic}`);

        return this.backend.subscribeFcm(token, topic).pipe(
            tap(console.log)
        );
    }

    // Send to server to unsubscribe
    unsubscribe(topic: string, token: string): Observable<any> {
        console.log(`Unsubscribing topic: ${topic}`);

        return this.backend.subscribeFcm(token, topic).pipe(
            tap(console.log)
        );
    }
}
