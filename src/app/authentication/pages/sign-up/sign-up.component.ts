import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';

import { BackendService } from '../../../services/backend/backend.service';
import { AuthService } from '../../../services/auth/auth.service';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-sign-up',
    templateUrl: './sign-up.component.html',
    styleUrls: ['./sign-up.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class SignUpComponent implements OnDestroy {
    unsub$ = new Subject();
    hide$ = new BehaviorSubject(true);
    processing$ = new BehaviorSubject(false);
    globalError$ = new BehaviorSubject('');

    registerForm = this.fb.group({
        username: ['', Validators.required],
        email: ['',
            [
                Validators.required,
                Validators.email
            ]
        ],
        password: ['', Validators.required],
        password2: ['', Validators.required]
    }, {
        validator: this.MustMatch('password', 'password2')
    });

    constructor(
        private backend: BackendService,
        private auth: AuthService,
        private router: Router,
        private fb: FormBuilder
    ) {}

    getErrors(control: string): string {
        switch (true) {
            case this.registerForm.get(control).hasError('required'):
                return `${this.prettyCapitalize(control.replace(/[0-9]/g, ''))} is required`;

            case this.registerForm.get(control).hasError('mustMatch'):
                return `${this.prettyCapitalize(control.replace(/[0-9]/g, ''))} must match`;

            case this.registerForm.get(control).hasError('email'):
                    return `${this.prettyCapitalize(control)} is not an email`;
        }
    }

    doRegister() {
        // Reset error
        this.globalError$.next('');

        // Validate form before submission
        this.registerForm.markAllAsTouched();
        if (this.registerForm.invalid) { return; }

        // Submit request to API
        this.processing$.next(true);

        // Get login data
        const username = this.registerForm.controls['username'].value;
        const email = this.registerForm.controls['email'].value;
        const password = this.registerForm.controls['password'].value;

        this.backend.signUp(username, password, email).pipe(
            tap(() => this.processing$.next(false)),
            takeUntil(this.unsub$)
        ).subscribe({
            next: (response: any) => {
                // Do sign in action
                this.auth.doSignIn(response);

                // Navigate to feed
                this.router.navigateByUrl('/wallet');
            }, error: (error: any) => {
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

    MustMatch(controlName: string, matchingControlName: string) {
        return (formGroup: FormGroup) => {
            const control = formGroup.controls[controlName];
            const matchingControl = formGroup.controls[matchingControlName];

            if (matchingControl.errors && !matchingControl.errors.mustMatch) {
                // return if another validator has already found an error on the matchingControl
                return;
            }

            // set error on matchingControl if validation fails
            if (control.value !== matchingControl.value) {
                matchingControl.setErrors({ mustMatch: true });
            } else {
                matchingControl.setErrors(null);
            }
        };
    }

    prettyCapitalize(text: string): string {
        return text[0].toUpperCase() + text.substring(1);
    }

    ngOnDestroy(): void {
        this.unsub$.next();
        this.unsub$.complete();
    }
}
