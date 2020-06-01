import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Platform } from '@ionic/angular';
import { Plugins } from '@capacitor/core';
import { AuthService } from './services/auth/auth.service';
import { UserService } from './services/user/user.service';
import { Link } from './shared/core/link';
import { Observable, of } from 'rxjs';
import { tap, distinctUntilChanged, switchMap, map } from 'rxjs/operators';

const { SplashScreen } = Plugins;

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppComponent {

    private menuLinks$: Observable<Link[]> = this.authLinks();
    activeLinks: Observable<Link | Link[]> = this.menuLinks$.pipe(
        // Switch auth status
        switchMap(() => this.userSignedIn()),
        distinctUntilChanged(),
        tap(m => console.log('auth.isLoggedIn', m)),
        // Return app links or auth links
        switchMap(l => !!l ? this.mainLinks() : this.authLinks()),
        tap(m => console.log('Menu links', m)),
    );

    constructor(
        private platform: Platform,
        private user$: UserService,
        private auth: AuthService,
    ) {
        this.init();
    }

    init(): void {
        this.platform.ready()
            .then(() => SplashScreen.hide());
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

    authLinks(): Observable<Link[]> {
        return of([
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
        ])
    }

    mainLinks(): Observable<Link[]> {
        return this.user$.profile$.pipe(
            map(p => [
                {
                    name: 'Wallet',
                    icon: 'fas fa-wallet',
                    link: '/wallet',
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
                    link: `/profile/${p?.username}`,
                    condition: true
                }, {
                    name: 'Top-up Wallet',
                    icon: 'fas fa-hand-holding-usd',
                    link: '/transaction/create',
                    params: {to: 'me'},
                    condition: true
                }, {
                    name: 'Settings',
                    icon: 'fas fa-cog',
                    link: '/settings',
                    condition: true
                }
            ])
        );
    }
}
