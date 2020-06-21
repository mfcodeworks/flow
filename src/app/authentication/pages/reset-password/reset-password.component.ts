import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { BackendService } from '../../../services/backend/backend.service';
import { tap, map, takeUntil } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResetPasswordComponent implements OnInit, OnDestroy {
    unsub$ = new Subject();
    hide$ = new BehaviorSubject(true);
    processing$ = new BehaviorSubject(false);
    complete$ = new BehaviorSubject(false);
    globalError$ = new BehaviorSubject('');
    resetToken: string;
    email: string;
    resetForm: FormGroup;

    constructor(
        private backend: BackendService,
        private route: ActivatedRoute,
        private fb: FormBuilder
    ) {}

    ngOnInit() {
        // Get email from query params
        this.route.queryParamMap.pipe(
            tap(params => console.log(params)),
            map(params => this.email = params.get('email')),
            tap(_ => console.log(this.email)),
            takeUntil(this.unsub$)
        ).subscribe();

        // Get reset token from URL
        this.route.paramMap.pipe(
            tap(params => console.log(params)),
            map(params => this.resetToken = params.get('token')),
            tap(_ => console.log(this.resetToken)),
            takeUntil(this.unsub$)
        ).subscribe();

        this.resetForm = this.fb.group({
            email: [this.email, Validators.required],
            password: ['', Validators.required],
            password2: ['', Validators.required]
        }, {
            validator: this.MustMatch('password', 'password2')
        });
    }

    getErrors(control: string) {
        switch (true) {
            case this.resetForm.get(control).hasError('required'):
                return `${this.prettyCapitalize(control.replace(/[0-9]/g, ''))} is required`;

            case this.resetForm.get(control).hasError('mustMatch'):
                return `${this.prettyCapitalize(control.replace(/[0-9]/g, ''))} must match`;
        }
    }

    doReset() {
        // Reset error
        this.globalError$.next('');

        // Validate form before submission
        this.resetForm.markAllAsTouched();
        if (this.resetForm.invalid)
            return;

        // Submit request to API
        this.processing$.next(true);

        const password = this.resetForm.controls['password'].value;
        const password2 = this.resetForm.controls['password2'].value;

        this.backend.resetPassword(this.resetToken, this.email, password, password2) .pipe(
            tap(() => this.processing$.next(false)),
            tap(() => this.complete$.next(false)),
            takeUntil(this.unsub$)
        ).subscribe({
            next: () => {},
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
                        this.globalError$.next((!!error.error.validator) ?
                            Object.keys(error.error.validator).map(errorText => {
                                return `${error.error.validator[errorText]}<br />`;
                            }).join('') : error.error.error.email
                        )
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

    prettyCapitalize(text: string) {
        return text[0].toUpperCase() + text.substring(1);
    }

    ngOnDestroy(): void {
        this.unsub$.next();
        this.unsub$.complete();
    }
}
