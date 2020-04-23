// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,

    // API: Server URL
    apiUrl: 'https://api.wallet.nygmarosebeauty.com/api/v1',
    appUrl: 'https://wallet.nygmarosebeauty.com',

    // API: Exchange Rates API
    fx: {
        url: 'https://openexchangerates.org/api/latest.json',
        client_id: 'c56480251bae4d4ca59f1ff85d954429'
    },

    // API: Stripe Details
    stripe: {
        client_id: 'ca_Dtemp3RTqA3RHzlGbSxwdAKTTn4n6fGl',
        public_key: 'pk_test_q4I6d4V8onnBC31PJOdKjY8i'
    },

    // API: Firbase Services
    firebase: {
        apiKey: "AIzaSyAIrCRt4FSgS4DMUTZj2xUMMSymAtCq0Wk",
        authDomain: "nr-wallet-5e82a.firebaseapp.com",
        databaseURL: "https://nr-wallet-5e82a.firebaseio.com",
        projectId: "nr-wallet-5e82a",
        storageBucket: "nr-wallet-5e82a.appspot.com",
        messagingSenderId: "427082487138",
        appId: "1:427082487138:web:698543e31791e68601083b",
        measurementId: "G-7C9PRZ0J72"
    },

    fcm: {
        topics: ['test'],
        iconColor: 'black',
        icon: 'assets/images/logo',
        channels: {
            'PushPluginChannel': 'Miscellaneous',
            'transfers': 'Transfers',
            'payouts': 'Withdrawls',
            'payment_methods': 'Payment Sources'
        }
    },

    cache: {
        name: 'flow',
        description: 'Flow local storage cache',
        store: 'flow_cache'
    },

    themes: {
        purple: ''
    },

    runes: [{
        quote: 'NR Donates 10% of all Income to Non-Profit Organisations Across the World!',
        author: 'NygmaRose'
    }, {
        quote: 'At NR We Make All Our Apps Open Source and Available to All. You Can See Our Projects at Github.com/NygmaRose.',
        author: 'NygmaRose'
    }, {
        quote: 'NR Has a Goal to Help the World. At NR We Strive to Partner and Promote as Many Non-Profit Organisations as We Can. Tweet Us Some to Explore New Opportunities!',
        author: 'NygmaRose'
    }]
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.
