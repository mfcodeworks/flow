import { Component, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

import { BackendService } from '../../../services/backend/backend.service';
import { takeUntil, tap } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-forgot-password',
    templateUrl: './forgot-password.component.html',
    styleUrls: ['./forgot-password.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class ForgotPasswordComponent implements OnDestroy {
    unsub$ = new Subject();
    globalError$ = new BehaviorSubject('');
    processing$ = new BehaviorSubject(false);
    complete$ = new BehaviorSubject(false);

    forgotForm = this.fb.group({
        email: ['',
            [
                Validators.required,
                Validators.email
            ]
        ],
    });

    constructor(
        private backend: BackendService,
        private fb: FormBuilder
    ) {}

    getErrors(control: string) {
        switch (true) {
            case this.forgotForm.get(control).hasError('required'):
                return `${this.prettyCapitalize(control)} is required`;

            case this.forgotForm.get(control).hasError('email'):
                    return `${this.prettyCapitalize(control)} is not an email`;
        }
    }

    doReset() {
        // Reset error
        this.globalError$.next('');

        // Validate form before submission
        this.forgotForm.markAllAsTouched();
        if (this.forgotForm.invalid)
            return;

        // Submit request to API
        this.processing$.next(true);

        const email = this.forgotForm.controls['email'].value;

        this.backend.forgotPassword(email).pipe(
            tap(() => this.processing$.next(false)),
            takeUntil(this.unsub$)
        ).subscribe({
            next: () => {
                // Set complete as true
                this.complete$.next(true);
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
                        )
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
