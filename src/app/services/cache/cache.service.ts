import { Injectable } from '@angular/core';
import { from, Observable, iif, of } from 'rxjs';
import localforage from 'localforage';
import AES from "crypto-js/aes";
import Utf8 from 'crypto-js/enc-utf8';
import { environment } from 'src/environments/environment';
import { map, mergeMap, catchError } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class CacheService {

    // Init Cache
    async init(): Promise<boolean> {
        console.log('Configuring Cache', environment.cache);

        // Configure local storage
        return localforage.config(environment.cache);
    }

    // Store item
    store(key: string, data: any, passphrase?: string): Observable<any> {
        let ciphertext: string;

        // If passphrase exists, encrypt data
        if (passphrase) {
            console.log('Store', JSON.stringify(data), '\nKey', passphrase);
            ciphertext = AES.encrypt(JSON.stringify(data), passphrase).toString();
            return from(localforage.setItem(key, ciphertext));
        }

        // If passphrase store encrypted text, else store JSON string
        return from(localforage.setItem(key, data));
    }

    // Get item
    get(key: string, passphrase?: string): Observable<any|void> {
        console.log(`Retrieving ${key} from cache`);
        return from(localforage.getItem(key)).pipe(
            // Switch passphrase present
            mergeMap((data: any) =>
                iif(
                    () => !!passphrase,
                    // Decode data
                    of(true).pipe(
                        map(() => JSON.parse(
                            AES.decrypt(data, passphrase).toString(Utf8)
                        ))
                    ),
                    // Return data
                    of(data)
                )
            ),
            catchError(err => {
                console.warn(err);
                return null;
            })
        );
    }

    // Delete item
    delete(key: string): Observable<void> {
        return from(localforage.removeItem(key));
    }

    // Clear cache
    clear(): Observable<void> {
        return from(localforage.clear());
    }
}
