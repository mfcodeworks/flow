import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SHA256, enc } from 'crypto-js';
import { Profile } from '../../core/profile';
import { UserService } from 'src/app/services/user/user.service';
import { environment } from 'src/environments/environment';
import { BackendService } from 'src/app/services/backend/backend.service';

@Component({
    selector: 'app-stripe-signup',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './stripe-signup.component.html',
    styleUrls: ['./stripe-signup.component.scss']
})
export class StripeSignupComponent implements OnInit {
    user: Profile;
    code: string;
    state: string;
    verified: boolean = false;

    constructor(
        private route: ActivatedRoute,
        private user$: UserService,
        private backend: BackendService
    ) { }

    ngOnInit() {
        this.user = this.user$.profile
        this.route.queryParamMap.subscribe(params => {
            this.code = params.get('code')
            this.state = params.get('state')

            if (this.verifyState()) {
                this.verified = true;
                this.backend.registerStripe(this.code)
                .subscribe(profile => Object.assign(this.user$.profile, profile))
            }
        })
    }

    verifyState(): boolean {
        return SHA256(this.user.toString(), environment.stripe.public_key).toString(enc.Hex) === this.state
    }
}
