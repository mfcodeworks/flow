import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { AuthService } from './services/auth/auth.service';
import { UserService } from './services/user/user.service';
import { Link } from './shared/interfaces/link';
import { BehaviorSubject, Observable } from 'rxjs';
import { mergeMap, tap, distinctUntilChanged, switchMap } from 'rxjs/operators';
const { SplashScreen } = Plugins;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {
    /* TODO: Add QR Scanning */

    private mainLinks$: BehaviorSubject<Link[]> = new BehaviorSubject([
        {
            name: 'Wallet',
            icon: 'fas fa-wallet',
            link: '/',
            condition: true
        }, {
            name: 'Withdraw',
            icon: 'fas fa-coins',
            link: '/withdraw',
            condition: !!this.user$.profile?.stripeConnectId
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
    ]);

    private authLinks$: BehaviorSubject<Link[]> = new BehaviorSubject([
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
    ]);

    private menuLinks$: BehaviorSubject<any> = new BehaviorSubject(this.authLinks$);

    constructor(
        private platform: Platform,
        public user$: UserService,
        public auth: AuthService,
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            console.log('Hiding SplashScreen');
            SplashScreen.hide();
        });
    }

    doSignOut(): void {
        this.auth.doSignOut();
    }

    userSignedIn(): Observable<boolean> {
        return this.auth.loggedIn;
    }

    activeLinks(): Observable<Link[]> {
        return this.menuLinks$.pipe(
            // Switch auth status
            switchMap(() => this.userSignedIn()),
            tap(m => console.log('auth.isLoggedIn', m)),
            distinctUntilChanged(),
            // Return app links or auth links
            mergeMap(l => l ? this.mainLinks$ : this.authLinks$),
            tap(m => console.log('Menu links', m)),
        );
    }
}
