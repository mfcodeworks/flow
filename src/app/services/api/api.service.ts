import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { retry, catchError, publishReplay, refCount } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { Profile } from '../../shared/core/profile';
import { Transaction } from '../../shared/core/transaction';
import { IOpenExchangeRates } from '../../shared/core/open-exchange-rates';
import { UserTransactions } from '../../shared/core/user-transactions';
import { ToastController } from '@ionic/angular';

const API_URL = environment.apiUrl;

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    constructor(
        private http: HttpClient,
        public toast: ToastController
    ) {}

    // API: Sign Up User
    signUp(username: string, password: string, email: string): Observable<any> {
        return this.http
        .post(`${API_URL}/register`, {
            username,
            password,
            email
        }, { headers: { 'Content-Type': 'application/json' }}).pipe(
            catchError((error) => this.handleError(error))
        );
    }

    // API: Sign In User
    signIn(username: string, password: string): Observable<any> {
        return this.http
        .post(`${API_URL}/login`, {
            username,
            password
        }, { headers: { 'Content-Type': 'application/json' }}).pipe(
            catchError((error) => this.handleError(error))
        );
    }

    // API: Send User Forgot Password Request
    forgotPassword(email: string): Observable<any> {
        return this.http
        .post(`${API_URL}/forgot`, {
            email
        }, { headers: { 'Content-Type': 'application/json' }}).pipe(
            catchError((error) => this.handleError(error))
        );
    }

    // API: Reset User Password
    resetPassword(token: string, email: string, password: string, passwordConfirmation: string): Observable<any> {
        return this.http
        .post(`${API_URL}/reset`, {
            token,
            email,
            password,
            password_confirmation: passwordConfirmation
        }, { headers: { 'Content-Type': 'application/json' }}).pipe(
            catchError((error) => this.handleError(error))
        );
    }

    // API: Get User Profile
    getUser(): Observable<Profile> {
        return this.http
        .get<Profile>(`${API_URL}/me`).pipe(
            publishReplay(),
            refCount(),
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Update User Profile
    updateUser(user: Profile | FormData): Observable<Profile> {
        // Fix for PHP not accepting files to PUT
        (user instanceof FormData) ?
            user.append('_method', 'PUT') :
            Object.assign(user, { _method: 'PUT' });

        return this.http
        .post<Profile>(`${API_URL}/me/update`, user).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Register User Stripe Account
    registerStripe(token: string): Observable<Profile> {
        return this.http
        .post<Profile>(`${API_URL}/me/stripe/register`, { token }, { headers: { 'Content-Type': 'application/json' }}).pipe(
            catchError((error) => this.handleError(error))
        );
    }

    // API: Deactivate user profile
    deactivateProfile(): Observable<any> {
        return this.http
        .post(`${API_URL}/me/deactivate`, null).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Save FCM Token
    saveFcm(token: string): Observable<any> {
        return this.http
        .post(`${API_URL}/me/fcm/token`, { token }, { headers: { 'Content-Type': 'application/json' }}).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Delete FCM Token
    deleteFcm(token: string): Observable<any> {
        return this.http
        .delete(`${API_URL}/me/fcm/token/${token}`).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Subscribe to FCM Topic
    subscribeFcm(token: string, topic: string): Observable<any> {
        return this.http
        .post(`${API_URL}/me/fcm/subscribe/${topic}`, { token }, { headers: { 'Content-Type': 'application/json' }}).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Unsubcribe from FCM Topic
    unsubscribeFcm(token: string, topic: string): Observable<any> {
        return this.http
        .post(`${API_URL}/me/fcm/unsubscribe/${topic}`, { token }, { headers: { 'Content-Type': 'application/json' }}).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Get user balance
    getUserBalance(): Observable<any> {
        return this.http
        .get(`${API_URL}/me/balance`).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Get user balance
    getUserDashboard(): Observable<any> {
        return this.http
        .get(`${API_URL}/me/stripe/dashboard`).pipe(
            publishReplay(),
            refCount(),
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Get user balance
    getCurrentUserStripe(): Observable<any> {
        return this.http
        .get(`${API_URL}/me/stripe/account`).pipe(
            publishReplay(),
            refCount(),
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Get user transactions
    getUserTransactions(): Observable<UserTransactions> {
        return this.http
        .get<UserTransactions>(`${API_URL}/transaction`).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Get user sources
    getUserSources(): Observable<any[]> {
        return this.http
        .get<any[]>(`${API_URL}/me/payment/source`).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Get user source
    getUserSource(method: string): Observable<any> {
        return this.http
        .get<any>(`${API_URL}/me/payment/source/${method}`).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Save user source
    saveUserSource(source: PaymentMethodData): Observable<PaymentMethodData> {
        return this.http
        .post<PaymentMethodData>(
            `${API_URL}/me/payment/source`,
            source,
            { headers: { 'Content-Type': 'application/json' } }
        ).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Delete user source
    deleteUserSource(method: string): Observable<boolean> {
        return this.http
        .delete<boolean>(
            `${API_URL}/me/payment/source/${method}`, {
            headers: { 'Content-Type': 'application/json' }
        }).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Get Transaction
    getTransaction(id: number): Observable<Transaction> {
        return this.http
        .get<Transaction>(`${API_URL}/transaction/${id}`)
        .pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }
    getTransactionByIntent(intent: string): Observable<Transaction> {
        return this.http
        .get<Transaction>(`${API_URL}/transaction/intent/${intent}`)
        .pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Get PaymentIntent
    getIntent(for_user_id: number, nonce: string): Observable<any> {
        return this.http
        .get(`${API_URL}/transaction/prepare?for_user_id=${for_user_id}&nonce=${nonce}`)
        .pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Update PaymentIntent
    updateIntent(stripe_transaction_id: string, amount: number, currency: string, description: string): Observable<any> {
        return this.http
        .put(`${API_URL}/transaction/update`, {
            stripe_transaction_id,
            amount,
            currency,
            description
        }, {
            headers: { 'Content-Type': 'application/json' }
        }).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Confirm Payment
    confirmPayment(payload: any): Observable<any> {
        return this.http
        .post(`${API_URL}/transaction/pay`, payload, {
            headers: { 'Content-Type': 'application/json' }
        }).pipe(
            catchError((error) => this.handleError(error))
        );
    }

    // API: Get Profile
    getProfile(id: string | number): Observable<Profile> {
        return this.http
        .get<Profile>(`${API_URL}/profile/${id}`).pipe(
            publishReplay(),
            refCount(),
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    getProfileByName(name: string): Observable<Profile> {
        return this.http
        .get<Profile>(`${API_URL}/profile/${name}`).pipe(
            publishReplay(),
            refCount(),
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Get Stripe Profile
    getStripeProfile(id: number): Observable<any> {
        return this.http
        .get<any>(`${API_URL}/profile/stripe/${id}`).pipe(
            publishReplay(),
            refCount(),
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: List User Withdrawls
    getStripeWithdrawls(): Observable<any> {
        return this.http
        .get(`${API_URL}/me/withdrawl`)
        .pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Withdraw Stripe balance
    withdrawStripeBalance(amount: number, currency: string): Observable<any> {
        return this.http
        .post<any>(`${API_URL}/me/withdrawl`, {
            amount, currency
        }).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: User Search
    search(query: string, type: string = ''): Observable<Profile[]> {
        return this.http
        .get<Profile[]>(`${API_URL}/search`, {
            params: { query, type }
        }).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // API: Update exchange rates
    updateRates(): Observable<IOpenExchangeRates> {
        return this.http
        .get<IOpenExchangeRates>(environment.fx.url, {
            params: { app_id: environment.fx.client_id }
        }).pipe(
            retry(1),
            catchError((error) => this.handleError(error))
        );
    }

    // Success handling
    handleSuccess(message: string) {
        // Open snackbar
        this.toast.create({
            header: message,
            duration: 3000
        }).then(t => t.present());
    }

    // Error handling
    handleError(error: any) {
        let errorMessage: string;
        console.warn(error);

        // Set error message
        errorMessage = `(${error.status}) Message: ${error.error.message || error.statusText}`

        // Open error snackbar
        this.toast.create({
            header: errorMessage,
            duration: 3000
        }).then(t => t.present());

        return throwError(errorMessage);
    }
}
