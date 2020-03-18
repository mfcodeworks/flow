import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { Profile } from '../../core/profile';
import { UserService } from '../../../services/user/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BackendService } from 'src/app/services/backend/backend.service';
import { map, catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject } from 'rxjs';

@Component({
    selector: 'app-user-settings',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './user-settings.component.html',
    styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {
    user: Profile
    settingsForm: FormGroup
    processing: BehaviorSubject<boolean> = new BehaviorSubject(false)

    constructor(
        private _user: UserService,
        private fb: FormBuilder,
        private _backend: BackendService,
        public toast: MatSnackBar
    ) {}

    ngOnInit() {
        this.user = this._user.profile;
        console.log('Settings user:', this.user);
        this.settingsForm = this.fb.group({
            email: [this.user.email, Validators.required],
            username: [this.user.username, Validators.required],
            password: [''],
            password_repeat: ['']
        }, { validator: this.matchPasswords('password', 'password_repeat') });

        this._user.profile$.pipe(tap(u => console.log('New settings user:', u))).subscribe(u => this.settingsForm.patchValue(u));
    }

    ngAfterContentInit() {
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
            catchError(err => {
                console.warn(err);
                this.processing.next(false);
                this.toast.open(`Profile Error: ${JSON.stringify(err)}`, 'close', { duration: 3000 });
                return err;
            })
        ).subscribe(u => {
            this.processing.next(false);
            this.settingsForm.patchValue(u);
            this.toast.open('Profile Successfully Updated', 'close', { duration: 3000 });
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
}
