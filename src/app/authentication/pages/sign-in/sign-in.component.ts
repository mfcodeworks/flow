import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { BackendService } from '../../../services/backend/backend.service';
import { AuthService } from '../../../services/auth/auth.service';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-sign-in',
    templateUrl: './sign-in.component.html',
    styleUrls: ['./sign-in.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignInComponent implements OnInit, OnDestroy {
    unsub$ = new Subject();
    hide$ = new BehaviorSubject(true);
    processing$ = new BehaviorSubject(false);
    globalError$ = new BehaviorSubject('');

    loginForm = this.fb.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
    });

    constructor(
        private backend: BackendService,
        private auth: AuthService,
        private router: Router,
        private fb: FormBuilder
    ) {}

    ngOnInit() {}

    getErrors(control: string) {
        switch (true) {
            case this.loginForm.get(control).hasError('required'):
                return `${this.prettyCapitalize(control)} is required`;

            case this.loginForm.get(control).hasError('mustMatch'):
                return `${this.prettyCapitalize(control)} must match`;
        }
    }

    doSignIn() {
        // Reset error
        this.globalError$.next('');

        // Validate form before submission
        this.loginForm.markAllAsTouched();
        if (this.loginForm.invalid)
            return;

        // Get login data
        const username = this.loginForm.controls['username'].value;
        const password = this.loginForm.controls['password'].value;

        // Submit request to API
        this.processing$.next(true);

        this.backend.signIn(username, password).pipe(
            // End processing
            tap(() => this.processing$.next(false)),
            takeUntil(this.unsub$)
        ).subscribe({
            next: (response: any) => {
                // Do sign in action
                this.auth.doSignIn(response);

                // Navigate to feed
                this.router.navigateByUrl('/wallet');
            },
            error: (error: any) => {
                // DEBUG: Log error
                console.warn(error);

                // Switch error and display friendly message
                switch (typeof error) {
                    // If error is a string attempt to friendlify string
                    case 'string':
                        switch (true) {
                            case error.indexOf('Unauthorized') > -1:
                                this.globalError$.next('Username or password incorrect');
                                break;

                            default:
                                this.globalError$.next(error);
                                break;
                        }
                        break;

                    // If error is an object check for validators, otherwise display error text
                    default:
                        this.globalError$.next((error.error.validator) ?
                            Object.keys(error.error.validator).map(errorText => {
                                return `${error.error.validator[errorText]}<br />`;
                            }).join('') : error.error.error
                        );
                        break;
                }
            }
        });
    }

    prettyCapitalize(text: string) {
        return text[0].toUpperCase() + text.substring(1);
    }

    ngOnDestroy(): void {
        this.unsub$.next();
        this.unsub$.complete();
    }
}
