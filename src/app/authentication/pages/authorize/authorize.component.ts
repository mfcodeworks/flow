import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AuthService } from '../../../services/auth/auth.service';
import { BehaviorSubject } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-authorize',
    templateUrl: './authorize.component.html',
    styleUrls: ['./authorize.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class AuthorizeComponent implements OnInit {
    hide = new BehaviorSubject(true);
    globalError: string = null;
    processing = false;

    authorizeForm = this.fb.group({
        password: ['', Validators.required]
    });

    constructor(
        private auth: AuthService,
        private router: Router,
        private route: ActivatedRoute,
        private fb: FormBuilder
    ) {}

    ngOnInit() {}

    getErrors(control: string) {
        switch (true) {
            case this.authorizeForm.get(control).hasError('required'):
                return `${this.prettyCapitalize(control)} is required`;
        }
    }

    doSignIn() {
        // Reset error
        this.globalError = null;

        // Validate form before submission
        this.authorizeForm.markAllAsTouched();
        if (this.authorizeForm.invalid) { return; }

        // Submit request to API
        this.processing = true;

        const password = this.authorizeForm.controls['password'].value

        this.auth.authorize(password)
        .pipe(
            map(s => {
                if(s) {
                    return this.route.queryParamMap.subscribe(
                        p => this.router.navigateByUrl(
                            decodeURIComponent(p.get('redirect'))
                        )
                    );
                }

                this.globalError = 'Password incorrect';
                return false;
            }),
        ).subscribe(_ => this.processing = false);
    }

    prettyCapitalize(text: string) {
        return text[0].toUpperCase() + text.substring(1);
    }
}
