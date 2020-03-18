import { Injectable } from '@angular/core';
import { AngularFireMessaging } from '@angular/fire/messaging';
import { Platform } from '@ionic/angular';
import {
    Plugins,
    PushNotification,
    PushNotificationToken,
    PushNotificationActionPerformed
} from '@capacitor/core';
import { BehaviorSubject } from 'rxjs';

import { environment } from '../../../environments/environment';
import { IpcService } from '../ipc/ipc.service';
import * as ipcChannels from 'electron-push-receiver/src/constants';
import { mergeMapTo, tap } from 'rxjs/operators';

const { PushNotifications, Device } = Plugins;

@Injectable({
    providedIn: 'root'
})
export class PushService {
    token: BehaviorSubject<string> = new BehaviorSubject('')

    constructor(
        private ipc: IpcService,
        private platform: Platform,
        private fire: AngularFireMessaging
    ) {}

    init(): void {
        console.log('Running FCM init');

        // DEBUG: Log device
        Device.getInfo().then(i => console.log(JSON.stringify(i, null, '\t')));

        // Check device
        if (this.platform.is('electron')) {
            // Setup for Electron
            this.electronInit();
        } else if (this.platform.is('hybrid')) {
            // Setup for mobile
            this.defaultInit();
        } else {
            // Setup for browser/PWA
            this.browserInit();
        }
    }

    // Default Non-Electron Init
    defaultInit() {
        // Register with Apple / Google to receive push via APNS/FCM
        PushNotifications.register();

        // On success, we should be able to receive notifications
        PushNotifications.addListener('registration', (token: PushNotificationToken) => {
            console.log(`FCM Registered ${JSON.stringify(token, null, '\t')}`);
            this.token.next(token.value);
        });

        // Some issue with our setup and push will not work
        PushNotifications.addListener('registrationError', (error: any) => {
            console.warn(`FCM Error ${JSON.stringify(error, null, '\t')}`);
        });

        // Show us the notification payload if the app is open on our device
        PushNotifications.addListener('pushNotificationReceived', (notification: PushNotification) => {
            console.log(`FCM Notification ${JSON.stringify(notification, null, '\t')}`);
        });

        // Method called when tapping on a notification
        PushNotifications.addListener('pushNotificationActionPerformed', (notification: PushNotificationActionPerformed) => {
            console.log(`Push action ${JSON.stringify(notification, null, '\t')}`);
        });
    }

    // Register push for browser
    browserInit(): void {
        console.log('Called FCM browser init');

        // Handle no service worker
        let noSw = setTimeout(() => this.browserRegisterSw(), 5 * 1000);

        // Wait for service worker to be ready
        navigator.serviceWorker.ready.then((registration: ServiceWorkerRegistration) => {
            clearTimeout(noSw);
            noSw = null;

            this.browserMessagingRegistration(registration);
        });
    }

    browserRegisterSw(): void {
        console.warn('No active service worker found, not able to get firebase messaging');
        navigator.serviceWorker.register('firebase-messaging-sw.js');
    }

    browserMessagingRegistration(registration: ServiceWorkerRegistration, token?: string): void {
        console.log('FCM Registration:', registration);

        this.fire.requestPermission.pipe(
            mergeMapTo(this.fire.tokenChanges),
            tap(console.log)
        ).subscribe(
            (token) => {
                console.log('FCM Permission Granted:', token);

                // Subscribe to FCM tokens
                this.token.next(token);

                // Subscribe to notifications
                this.fire.messages.subscribe(console.log)
            }, console.error
        );
    }

    // Register push for electron
    electronInit(): void {
        // Handle push registration
        this.ipc.on(ipcChannels.NOTIFICATION_SERVICE_STARTED, (_, token) => {
            console.log('Push service successfully started', token);
            this.token.next(token);
        });

        // Handle push errors
        this.ipc.on(ipcChannels.NOTIFICATION_SERVICE_ERROR, (_, error) => {
            console.warn('Push notification error', error);
        });

        // Send token to backend when updated
        this.ipc.on(ipcChannels.TOKEN_UPDATED, (_, token) => {
            console.log('Push token updated', token);
            this.token.next(token);
        });

        // Display notification
        this.ipc.on(ipcChannels.NOTIFICATION_RECEIVED, (_, fcmNotification) => {
            // DEBUG: Log notification
            console.log('Notification', fcmNotification);

            // Check notification for display title
            if (fcmNotification.notification.title || fcmNotification.notification.body) {
                Notification.requestPermission().then(p => {
                    if (p !== 'granted') {
                        return;
                    }

                    const notification = new Notification(fcmNotification.notification.title, {
                        body: fcmNotification.notification.body || '',
                        icon: fcmNotification.notification.icon || 'assets/icons/icon-128x128.png'
                    });

                    notification.onclick = () => {
                        console.log('Notification clicked');
                    };
                });
                return;
            }

            // Payload has no body, so consider it silent (just consider the data portion)
        });

        // Start service
        console.log('Starting Electron push');
        this.ipc.send(ipcChannels.START_NOTIFICATION_SERVICE, environment.firebase.messagingSenderId);
    }
}
