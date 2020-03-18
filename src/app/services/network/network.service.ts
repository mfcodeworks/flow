import { Injectable } from '@angular/core';
import { Plugins } from '@capacitor/core';

const { Network, Modals } = Plugins;

@Injectable({
    providedIn: 'root'
})
export class NetworkService {
    async init(): Promise<void> {
        // Initial network check
        this.alertStatusNeeded();

        // Subscribe to change events for checking
        Network.addListener('networkStatusChange', this.alertStatusNeeded);
    }

    async alertStatusNeeded(): Promise<void> {
        // Check status and alert if needed
        let connected = await Network.getStatus().then(n => n.connected);
        if (!connected) {
            await Modals.alert({
                title: 'Network Needed',
                message: 'A network connection is needed to use Flow, please enable Wi-Fi or data.'
            });
        }
    }
}
