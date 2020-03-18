import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { BackendService } from '../../../services/backend/backend.service';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
    selector: 'app-authorize',
    templateUrl: './authorize.component.html',
    styleUrls: ['./authorize.component.css']
})
export class AuthorizeComponent implements OnInit {
    hide = true;
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

    doSignIn(password: string) {
        // Reset error
        this.globalError = null;

        // Validate form before submission
        this.authorizeForm.markAllAsTouched();
        if (this.authorizeForm.invalid) { return; }

        // Submit request to API
        this.processing = true;

        this.auth
        .authorize(password)
        .subscribe(
            (success: boolean) => success
                ? this.route.queryParamMap.subscribe(p => this.router.navigateByUrl(
                    decodeURIComponent(p.get('redirect'))
                ))
                : this.globalError = 'Password incorrect',
            () => console.warn,
            () => this.processing = false
        );
    }

    prettyCapitalize(text: string) {
        return text[0].toUpperCase() + text.substring(1);
    }
}
