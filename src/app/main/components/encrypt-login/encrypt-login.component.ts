import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from '../../../services/user/user.service';
import { MatDialog } from '@angular/material/dialog';
import { EncryptLoginDialogComponent } from './encrypt-login-dialog/encrypt-login-dialog.component';
import { CacheService } from '../../../services/cache/cache.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { mergeMap } from 'rxjs/operators';

@Component({
    selector: 'app-encrypt-login',
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './encrypt-login.component.html',
    styleUrls: ['./encrypt-login.component.scss']
})
export class EncryptLoginComponent implements OnInit {
    encryptForm: FormGroup;

    constructor(
        private fb: FormBuilder,
        private _user: UserService,
        private _cache: CacheService,
        public dialog: MatDialog
    ) {
        this.encryptForm = this.fb.group({
            encrypt: false
        })
    }

    ngOnInit() {
        this._cache.get('encrypt-login').subscribe(e =>
            this.encryptForm.patchValue({
                encrypt: !!e
            })
        );
    }

    openDialog(): void {
        // Open dialog
        const dialogRef = this.dialog.open(EncryptLoginDialogComponent);

        // Handle dialog close (Encrypt success/cancel)
        dialogRef.afterClosed().subscribe(encrypt => {
            this.encryptForm.patchValue({ encrypt: !!encrypt })
        });
    }

    onEncryptLogin(event: MatSlideToggleChange): void {
        if (event.checked) {
            this.openDialog();
        } else {
            // Unencrypt login
            this._user.cacheUser().pipe(
                mergeMap(() => this._cache.store('encrypt-login', false))
            ).subscribe();
        }
    }
}
