import { Component, ChangeDetectionStrategy, ViewChild, ElementRef } from '@angular/core';
import { Platform, IonInput, AlertController } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { AuthService } from './services/auth/auth.service';
import { UserService } from './services/user/user.service';
import { Link } from './shared/interfaces/link';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap, distinctUntilChanged, switchMap, map } from 'rxjs/operators';
import { QRService } from './services/qr/qr.service';
import { environment } from '../environments/environment';
import { Router } from '@angular/router';

const { SplashScreen } = Plugins;
const qrTest = new RegExp(`${environment.appUrl}/profile/[0-9]`.replace('/', '\\/'));

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
    /* TODO: Add QR Scanning */
    @ViewChild("qrFile", {static: true}) qrFile: IonInput;
    @ViewChild("qrFileCanvas", {static: true}) qrCanvas: ElementRef<HTMLCanvasElement>;

    private menuLinks$: BehaviorSubject<Link[]> = new BehaviorSubject(this.authLinks());

    constructor(
        private platform: Platform,
        private user$: UserService,
        private auth: AuthService,
        private _qr: QRService,
        private _router: Router,
        private _alerts: AlertController
    ) {
        this.init();
    }

    init(): void {
        this.platform.ready().then(() => SplashScreen.hide());
    }

    isBrowser(): boolean {
        return !this.platform.is('hybrid');
    }

    async getQrFile(): Promise<void> {
        const file = await this.qrFile.getInputElement();
        file.click();
    }

    async qrScan(ev?: any): Promise<void> {
        const alert = await this._alerts.create({
            header: 'No QR Detected',
            message: 'No Flow QR code was detected',
            buttons: ['Okay']
        });

        let data: string = '';

        if (ev) {
            // Get file
            const {files} = await this.qrFile.getInputElement()
            const file = files[0];

            if (!file) {
                return;
            }

            // Scan file
            data = await this._qr.scan(file);

            // Alert if no QR was found
            if (!data) {
                console.warn('Alerting no QR');
                await alert.present();
            }
        } else {
            // Camera scan
            data = await this._qr.scan();
            if (!data) {
                return;
            }
        }

        // DEBUG: Log QR data
        console.log(`QR Scanner Detected ${data}`);
        console.log('QR Testing', qrTest.test(data));

        // Test if QR code has a valid profile URL
        if (qrTest.test(data)) {
            this._router.navigateByUrl(data.replace(environment.appUrl, ''));
        } else {
            console.warn('Alerting no QR');
            await alert.present();
        }

        // Clear QR file input
        (<HTMLInputElement>document.getElementById('qrFile')).value = "";
    }

    doSignOut(): void {
        this.auth.doSignOut();
    }

    userHasAccount(): boolean {
        return !!this.user$.profile.stripeConnectId;
    }

    userSignedIn(): Observable<boolean> {
        return this.auth.loggedIn;
    }

    authLinks(): Link[] {
        return [
            {
                name: 'Login',
                icon: 'fas fa-sign-in-alt',
                link: '/login',
                condition: true
            }, {
                name: 'Sign Up',
                icon: 'fas fa-user-plus',
                link: '/register',
                condition: true
            }, {
                name: 'Reset Password',
                icon: 'fas fa-key',
                link: '/password/reset',
                condition: true
            }
        ]
    }

    mainLinks(): Link[] {
        return [
            {
                name: 'Wallet',
                icon: 'fas fa-wallet',
                link: '/',
                condition: true
            }, {
                name: 'Withdraw',
                icon: 'fas fa-coins',
                link: '/withdraw',
                condition: !!this.userHasAccount()
            }, {
                name: 'Search',
                icon: 'fas fa-search-dollar',
                link: '/search',
                condition: true
            }, {
                name: 'Profile',
                icon: 'fas fa-qrcode',
                link: '/profile/me',
                condition: true
            }, {
                name: 'Top-up Wallet',
                icon: 'fas fa-hand-holding-usd',
                link: '/transaction/create',
                params: { to: 'me' },
                condition: true
            }, {
                name: 'Settings',
                icon: 'fas fa-cog',
                link: '/settings',
                condition: true
            }
        ];
    }

    activeLinks(): Observable<Link | Link[]> {
        return this.menuLinks$.pipe(
            // Switch auth status
            switchMap(() => this.userSignedIn()),
            distinctUntilChanged(),
            tap(m => console.log('auth.isLoggedIn', m)),
            // Return app links or auth links
            map(l => !!l ? this.mainLinks() : this.authLinks()),
            tap(m => console.log('Menu links', m)),
        );
    }
}
