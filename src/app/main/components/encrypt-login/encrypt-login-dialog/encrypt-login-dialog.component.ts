import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../../services/user/user.service';
import { tap, mergeMap, switchMap, take } from 'rxjs/operators';
import { CacheService } from '../../../../services/cache/cache.service';
import { ModalController } from '@ionic/angular';

export interface EncryptLoginDialogData {
    encrypt: boolean;
}

@Component({
    selector: 'app-encrypt-login-dialog',
    templateUrl: './encrypt-login-dialog.component.html',
    styleUrls: ['./encrypt-login-dialog.component.scss']
})
export class EncryptLoginDialogComponent implements OnInit {
    encryptForm: FormGroup

    constructor(
        private fb: FormBuilder,
        private _user: UserService,
        private _cache: CacheService,
        public dialogRef: ModalController
    ) { }

    ngOnInit() {
        this.encryptForm = this.fb.group({
            password: ['', Validators.required],
            password_repeat: ['', Validators.required]
        }, {validator: this.matchPasswords('password', 'password_repeat')});
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
            control.value !== matchingControl.value
                ? matchingControl.setErrors({mismatch: true})
                : matchingControl.setErrors(null);
        };
    }

    getErrors(control: string) {
        switch (true) {
            case this.encryptForm.get(control).hasError('required'):
                return `${this.prettyCapitalize(control)} required`;

            case this.encryptForm.get(control).hasError('mismatch'):
                return `Passwords must match`;
        }
    }

    onNoClick(): void {
        this.close(false);
    }

    onSuccess(): void {
        this.encryptForm.markAllAsTouched()
        if (this.encryptForm.invalid) {
            console.log(this.encryptForm.errors)
            return
        }

        // Encrypt login
        this._user.cacheUser(this.encryptForm.get('password').value).pipe(
            tap(console.log),
            switchMap(() => this._cache.store('encrypt-login', true)),
            take(1)
        ).subscribe(
            () => this.close(true),
            err => {
                console.warn('Encrypt Login Error:', err);
                // Ensure unencrypted login
                this._user.cacheUser().pipe(
                    mergeMap(() => this._cache.store('encrypt-login', false)),
                    tap(() => this.close(false)),
                    take(1)
                ).subscribe();
            }
        )
    }

    prettyCapitalize(text: string) {
        return text[0].toUpperCase() + text.substring(1);
    }

    close(encrypt = false): void {
        this.dialogRef.dismiss({encrypt});
    }
}
