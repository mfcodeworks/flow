import { Component, OnInit, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { Profile } from '../../../shared/core/profile';
import { UserService } from '../../../services/user/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendService } from 'src/app/services/backend/backend.service';
import { tap, filter, takeUntil } from 'rxjs/operators';
import { BehaviorSubject, Subject } from 'rxjs';
import { ToastController } from '@ionic/angular';

@Component({
    selector: 'app-user-settings',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './user-settings.component.html',
    styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit, OnDestroy {
    unsub$ = new Subject();
    user: Profile
    settingsForm: FormGroup
    processing: BehaviorSubject<boolean> = new BehaviorSubject(false)

    constructor(
        private _user: UserService,
        private fb: FormBuilder,
        private _backend: BackendService,
        public toast: ToastController
    ) {}

    ngOnInit() {
        this.user = this._user.profile;
        console.log('Settings user:', this.user);
        this.settingsForm = this.fb.group({
            email: [this.user.email, Validators.required],
            username: [this.user.username, Validators.required],
            password: [''],
            password_repeat: ['']
        }, {validator: this.matchPasswords('password', 'password_repeat')});

        this._user.profile$.pipe(
            tap(u => console.log('New settings user:', u)),
            filter(u => !!u),
            takeUntil(this.unsub$)
        ).subscribe(u => this.settingsForm.patchValue(u));
    }

    onSubmit(): void {
        this.settingsForm.markAllAsTouched();
        if (this.settingsForm.invalid) {
            return;
        }

        const data = this.settingsForm.value;
        console.log('Updating user with:', data)
        if (data.password == '') {
            delete data.password;
        }

        console.log('Payload:', Object.assign({}, this.user, data))
        this.processing.next(true);
        this._backend.updateUser(Object.assign({}, this.user, data)).pipe(
            tap(u => this._user.profile = u),
            tap(u => this._user.profile$.next(u)),
            takeUntil(this.unsub$)
        ).subscribe({
            next: u => {
                this.processing.next(false);
                this.settingsForm.patchValue(u);
                this.toast.create({
                    header: 'Profile Successfully Updated',
                    duration: 3000
                }).then(t => t.present());
            },
            error: err => {
                console.warn(err);
                this.processing.next(false);
                this.toast.create({
                    header: `Profile Error: ${JSON.stringify(err)}`,
                    duration: 3000
                }).then(t => t.present());
                return err;
            }
        });
    }

    matchPasswords(control1: string, control2: string) {
        return (formGroup: FormGroup) => {
            const control = formGroup.controls[control1];
            const matchingControl = formGroup.controls[control2];

            if (matchingControl.errors && !matchingControl.errors.mustMatch) {
                // return if another validator has already found an error on the matchingControl
                return;
            }

            // set error on matchingControl if validation fails
            if (control.value !== matchingControl.value) {
                matchingControl.setErrors({ mismatch: true });
            } else {
                matchingControl.setErrors(null);
            }
        };
    }

    getErrors(control: string) {
        switch (true) {
            case this.settingsForm.get(control).hasError('required'):
                return `${this.prettyCapitalize(control)} is required`;

            case this.settingsForm.get(control).hasError('mismatch'):
                return `Passwords must match`;
        }
    }

    prettyCapitalize(text: string) {
        return text[0].toUpperCase() + text.substring(1);
    }

    ngOnDestroy(): void {
        this.unsub$.next();
        this.unsub$.complete();
    }
}
