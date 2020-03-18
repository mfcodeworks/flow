import { Injectable } from '@angular/core';
import { PushService } from '../push/push.service';
import { AuthService } from '../auth/auth.service';
import { BackendService } from '../backend/backend.service';
import { filter, tap, mergeMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    // DEBUG: Fix backend save token and subscribe topic

    constructor(
        private push: PushService,
        private auth: AuthService,
        private backend: BackendService
    ) {
        // On new token, if token has value and user is logged in, save
        push.token.pipe(
            tap(token => console.log(`New FCM token ${token}`)),
            filter(token => !!token),
            filter(() => auth.loggedIn.value),
            mergeMap(token => this.saveToken(token))
        ).subscribe()

        // On new login status, update token status
        auth.loggedIn.pipe(
            tap(l => console.log(`User Login Status Changed to ${l}`)),

            // If token has no value we can't proceed
            filter(() => !!push.token.value),

            // Merge to backend call
            mergeMap(l => l ? this.saveToken(push.token.value) : this.deleteToken(push.token.value))
        ).subscribe()
    }

    // Init push services
    init(): void {
        return this.push.init()
    }

    // Send to server to save token
    private saveToken(token: string): Observable<any> {
        console.log(`Saving Token: ${token}`);

        // Send token to server
        return this.backend.saveFcm(token).pipe(
            tap(() => console.log(`Saved FCM ${token}`))
        );
    }

    // Send to server to delete token
    private deleteToken(token: string): Observable<any> {
        console.log(`Unsaving Token: ${token}`);

        // Send token to server
        return this.backend.deleteFcm(token).pipe(
            tap(() => console.log(`Deleted FCM ${token}`))
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
