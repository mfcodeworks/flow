import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService } from '../../../../services/user/user.service';
import { tap, mergeMap } from 'rxjs/operators';
import { CacheService } from '../../../../services/cache/cache.service';

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
        public dialogRef: MatDialogRef<EncryptLoginDialogData>
    ) { }

    ngOnInit() {
        this.encryptForm = this.fb.group({
            password: ['', Validators.required],
            password_repeat: ['', Validators.required]
        }, { validator: this.matchPasswords('password', 'password_repeat') });
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
            case this.encryptForm.get(control).hasError('required'):
                return `${this.prettyCapitalize(control)} is required`;

            case this.encryptForm.get(control).hasError('mismatch'):
                return `Passwords must match`;
        }
    }

    onNoClick(): void {
        this.dialogRef.close(false);
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
            mergeMap(() => this._cache.store('encrypt-login', true))
        ).subscribe(
            () => this.dialogRef.close(true),
            err => {
                console.warn('Encrypt Login Error:', err);
                // Ensure unencrypted login
                this._user.cacheUser().pipe(
                    mergeMap(() => this._cache.store('encrypt-login', false))
                ).subscribe(() => this.dialogRef.close(false));
            }
        )
    }

    prettyCapitalize(text: string) {
        return text[0].toUpperCase() + text.substring(1);
    }
}
