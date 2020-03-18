import { Component, OnInit, ViewChild } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { MatSidenav } from '@angular/material/sidenav';
import { NavigationStart, NavigationEnd, NavigationCancel, NavigationError, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { AuthService } from './services/auth/auth.service';
import { UserService } from './services/user/user.service';
import { delay } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: 'app.component.html',
    styleUrls: ['app.component.scss'],
    host: {'(window:resize)': 'onResize($event)'}
})
export class AppComponent implements OnInit {
    @ViewChild('sidenav') sidenav: MatSidenav
    loading = false;
    smallView = false;
    topOffset = 56;

    constructor(
        public router: Router,
        private viewportScroller: ViewportScroller,
        private platform: Platform,
        private splashScreen: SplashScreen,
        private statusBar: StatusBar,
        public user$: UserService,
        public auth: AuthService,
    ) {
        this.initializeApp();
    }

    initializeApp() {
        this.platform.ready().then(() => {
            this.statusBar.styleDefault();
            this.splashScreen.hide();
            
            this.router.events.pipe(delay(0))
            .subscribe((event: any) => {
                switch (true) {
                    case event instanceof NavigationStart:
                        this.loading = true;
                        break;

                    case event instanceof NavigationEnd:
                    case event instanceof NavigationCancel:
                    case event instanceof NavigationError:
                        this.loading = false;
                        break;

                    default:
                        break;
                }

                if (event.position) {
                    // backward navigation
                    this.viewportScroller.scrollToPosition(event.position);
                } else if (event.anchor) {
                    // anchor navigation
                    this.viewportScroller.scrollToAnchor(event.anchor);
                } else {
                    // forward navigation
                    this.viewportScroller.scrollToPosition([0, 0]);
                }
            });

            console.log('Loaded App Component');
        });
    }

    ngOnInit() {
        // Set initial view size
        this.onResize();
    }

    onResize() {
        this.smallView = window.innerWidth < 768
        this.topOffset = window.innerWidth < 600 ? 52 : 56
    }

    onSidenavClick() {
        this.smallView ? this.sidenav.toggle() : void(0);
    }
}
