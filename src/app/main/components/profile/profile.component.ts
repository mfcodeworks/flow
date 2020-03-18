import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Profile } from '../../core/profile';
import { UserService } from 'src/app/services/user/user.service';
import { ActivatedRoute } from '@angular/router';
import { BackendService } from 'src/app/services/backend/backend.service';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { tap, map } from 'rxjs/operators';

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
        this.profile = this.route.data.pipe(
            map(d => d.profile),
            tap(p => console.log('Profile:', p))
        );

        // Create QR Data
        this.qrData = this.profile.pipe(
            map(u => `${environment.appUrl}/profile/${u.id}`)
        );

        // Set User Stripe Profile
        this.stripeProfile = this.profile.pipe(
            map(p => this.backend.getStripeProfile(p.id).pipe(
                tap(s => console.log('Stripe profile:', s))
            ))
        );
    }
}
