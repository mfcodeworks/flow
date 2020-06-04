import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { UserService } from '../../../services/user/user.service';
import { EncryptLoginDialogComponent } from './encrypt-login-dialog/encrypt-login-dialog.component';
import { CacheService } from '../../../services/cache/cache.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { mergeMap } from 'rxjs/operators';
import { ModalController } from '@ionic/angular';
import { from } from 'rxjs';

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
        public dialog: ModalController
    ) {
        this.encryptForm = this.fb.group({
            encrypt: false
        });
    }

    ngOnInit() {
        this._cache.get('encrypt-login').subscribe(e =>
            this.encryptForm.patchValue({
                encrypt: !!e
            })
        );
    }

    async openDialog(): Promise<void> {
        // Open dialog
        const dialogRef = await this.dialog.create({
            component: EncryptLoginDialogComponent,
            cssClass: 'narrow-dialog'
        });
        await dialogRef.present();

        // Handle dialog close (Encrypt success/cancel)
        from(dialogRef.onDidDismiss()).subscribe(({data: {encrypt} = {encrypt: false}}) => {
            this.encryptForm.patchValue({ encrypt: !!encrypt })
        });
    }

    onEncryptLogin({detail}): void {
        if (detail.checked) {
            this.openDialog();
        } else {
            // Unencrypt login
            this._user.cacheUser().pipe(
                mergeMap(() => this._cache.store('encrypt-login', false))
            ).subscribe();
        }
    }
}
