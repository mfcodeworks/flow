import { Injectable } from '@angular/core';
import { BackendService } from '../backend/backend.service';
import { environment } from '../../../environments/environment';

declare const Stripe: any;

@Injectable({
    providedIn: 'root'
})
export class PaymentService {
    stripe: any;
    elements: any;

    constructor(
        private backend: BackendService
    ) { }

    async init(): Promise<void> {
        // Init stripe
        this.stripe = Stripe(environment.stripe.public_key);
        this.elements = this.stripe.elements();
    }
}
