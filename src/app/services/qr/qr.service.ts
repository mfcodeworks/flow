import { Injectable } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import QrScanner from 'qr-scanner';

@Injectable({
    providedIn: 'root'
})
export class QRService {

    constructor(private _qr: BarcodeScanner) {}

    async scan(file?: File): Promise<string> {
        try {
            // Handle browser based input
            if (file) {
                // DEBUG: Log ImageData
                console.log(`${this.constructor.name} received data:`, file);

                // Read and return
                const text = await QrScanner.scanImage(file);
                console.log(`${this.constructor.name} read image:`, text);
                return text;
            }

            // Read and return mobile input
            const { text } = await this._qr.scan();
            return text;
        } catch(e) {
            console.error(`${this.constructor.name} Error:`, e);
        }
    }
}
