import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Profile } from '../../../shared/core/profile';
import { UserService } from 'src/app/services/user/user.service';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from 'src/app/services/backend/backend.service';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { tap, switchMap, filter, map, take } from 'rxjs/operators';

@Component({
    selector: 'app-profile',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    user: Profile;
    profile: Observable<string>;
    profile$: Observable<Profile>;
    qrData: Observable<string>;
    stripeProfile: Observable<any>;

    constructor(
        private user$: UserService,
        private backend: BackendService,
        private route: ActivatedRoute
    ) { }

    ngOnInit() {
        // Set current user
        this.user = this.user$.profile;

        // Set User Profile
        this.profile = this.route.paramMap.pipe(
            map(p => p.get('profile'))
        );

        this.profile$ = this.profile.pipe(
            tap(id => console.warn('Fetch profile', id)),
            switchMap((id: string | number) => this.backend.getProfile(id)),
            tap(p => console.log('Profile:', p))
        );

        // Create QR Data
        this.profile.pipe(
            tap(p => this.qrData = of(`${environment.appUrl}/profile/${p}`)),
            take(1)
        ).subscribe();

        // Set User Stripe Profile
        this.stripeProfile = this.profile$.pipe(
            filter(p => !!p.id),
            switchMap(p => this.backend.getStripeProfile(p.id)),
            tap(s => console.log('Stripe profile:', s))
        );
    }
}
