import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ApiService } from '../api/api.service';
import { CacheService } from '../cache/cache.service';
import { Profile } from '../../shared/core/profile';
import { Transaction } from '../../shared/core/transaction';
import { IOpenExchangeRates } from '../../shared/core/open-exchange-rates';
import { UserTransactions } from '../../shared/core/user-transactions';

@Injectable({
  providedIn: 'root'
})
export class BackendService {
    constructor(
        private api: ApiService,
        private cache: CacheService
    ) {}

    // Sign Up User
    signUp(username: string, password: string, email: string): Observable<any> {
        return this.api.signUp(username, password, email);
    }

    // Sign In User
    signIn(username: string, password: string): Observable<any> {
        return this.api.signIn(username, password);
    }

    // Send User Forgot Password Request
    forgotPassword(email: string): Observable<any> {
        return this.api.forgotPassword(email);
    }

    // Reset User Password
    resetPassword(token: string, email: string, password: string, passwordConfirmation: string): Observable<any> {
        return this.api.resetPassword(token, email, password, passwordConfirmation);
    }

    // Get User Profile
    getUser(): Observable<Profile> {
        return this.api.getUser();
    }

    // Get user balance
    getUserBalance(): Observable<any> {
        return this.api.getUserBalance()
    }

    // Get user balance
    getUserDashboard(): Observable<any> {
        return this.api.getUserDashboard()
    }

    // Get user balance
    getCurrentUserStripe(): Observable<any> {
        return this.api.getCurrentUserStripe()
    }

    // Get user transactions
    getUserTransaction(): Observable<UserTransactions> {
        return this.api.getUserTransactions();
    }

    // Get user sources
    getUserSources(): Observable<any[]> {
        return this.api.getUserSources();
    }

    // Get user source
    getUserSource(method: string): Observable<any> {
        return this.api.getUserSource(method);
    }

    // Save user source
    saveUserSource(source: PaymentMethodData): Observable<PaymentMethodData> {
        return this.api.saveUserSource(source);
    }

    // Save user source
    deleteUserSource(method: string): Observable<boolean> {
        return this.api.deleteUserSource(method);
    }

    // Update User Profile
    updateUser(user: Profile | FormData): Observable<Profile> {
        return this.api.updateUser(user);
    }

    // Register User Stripe Account
    registerStripe(token: string): Observable<Profile> {
        return this.api.registerStripe(token);
    }

    // Deactivate user profile
    deactivateProfile(): Observable<any> {
        return this.api.deactivateProfile();
    }

    // Save FCM Token
    saveFcm(token: string): Observable<any> {
        return this.api.saveFcm(token);
    }

    // Delete FCM Token
    deleteFcm(token: string): Observable<any> {
        return this.api.deleteFcm(token);
    }

    // Subscribe to FCM Topic
    subscribeFcm(token: string, topic: string): Observable<any> {
        return this.api.subscribeFcm(token, topic);
    }

    // Unsubcribe from FCM Topic
    unsubscribeFcm(token: string, topic: string): Observable<any> {
        return this.api.unsubscribeFcm(token, topic);
    }

    // Get Transaction
    getTransaction(id: number): Observable<Transaction> {
        return this.api.getTransaction(id);
    }
    getTransactionByIntent(intent: string): Observable<Transaction> {
        return this.api.getTransactionByIntent(intent);
    }

    // Get Profile
    getProfile(id: string | number): Observable<Profile> {
        return this.api.getProfile(id).pipe(
            catchError((error) => {
                // Return from localStorage
                return this.cache.get(`profile-${id}`);
            })
        );
    }

    // Get Stripe Profile
    getStripeProfile(id: number): Observable<any> {
        return this.api.getStripeProfile(id);
    }

    // Get PaymentIntent
    getIntent(for_user_id: number, nonce: string): Observable<any> {
        return this.api.getIntent(for_user_id, nonce);
    }

    // Get PaymentIntent
    updateIntent(stripe_transaction_id: string, amount: number, currency: string, description: string): Observable<any> {
        return this.api.updateIntent(stripe_transaction_id, amount, currency, description);
    }

    // Confirm Payment
    confirmPayment(payload: any): Observable<any> {
        return this.api.confirmPayment(payload);
    }

    // List User Withdrawls
    getStripeWithdrawls(): Observable<any> {
        return this.api.getStripeWithdrawls();
    }

    // Withdraw Stripe balance
    withdrawStripeBalance(amount: number, currency: string): Observable<any> {
        return this.api.withdrawStripeBalance(amount, currency);
    }

    // User Search
    search(query: string, type?: string): Observable<Profile[]> {
        return this.api.search(query, type);
    }

    // Update exchange rate
    updateRates(): Observable<IOpenExchangeRates> {
        return this.api.updateRates();
    }
}
