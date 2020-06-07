import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import SHA256 from "crypto-js/sha256";
import Hex from 'crypto-js/enc-hex';
import { Profile } from '../../../shared/core/profile';
import { UserService } from 'src/app/services/user/user.service';
import { environment } from 'src/environments/environment';
import { BackendService } from 'src/app/services/backend/backend.service';
import { tap, take, switchMap, map } from 'rxjs/operators';

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
        this.route.queryParamMap.pipe(
            tap(params => {
                this.code = params.get('code');
                this.state = params.get('state');
            }),
            switchMap(_ => {
                if (this.verifyState()) {
                    this.verified = true;
                    return this.backend.registerStripe(this.code);
                }
            }),
            map(profile => Object.assign(this.user$.profile, profile)),
            take(1)
        ).subscribe();
    }

    verifyState(): boolean {
        return SHA256(this.user.toString(), environment.stripe.public_key).toString(Hex) === this.state
    }
}
