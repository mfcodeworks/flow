import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Profile } from '../../core/profile';
import { UserService } from 'src/app/services/user/user.service';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from 'src/app/services/backend/backend.service';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { tap, switchMap, filter, map } from 'rxjs/operators';

@Component({
    selector: 'app-profile',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {

    user: Profile;
    profile: Observable<Profile>;
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
            map(p => p.get('profile')),
            tap(id => console.warn('Fetch profile', id)),
            switchMap((id: string | number) => this.backend.getProfile(id)),
            tap(p => console.log('Profile:', p))
        );

        // Create QR Data
        this.qrData = of(`${environment.appUrl}/profile/${this.user.id}`);

        // Set User Stripe Profile
        this.stripeProfile = this.profile.pipe(
            filter(p => !!p.id),
            switchMap(p => this.backend.getStripeProfile(p.id)),
            tap(s => console.log('Stripe profile:', s))
        );
    }
}