export const environment = {
    production: true,

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
        client_id: 'ca_DtemdTVJ07jFjWby24msyzPlQ9i4T4E2',
        public_key: 'pk_live_CeCByERtgS6vu5FVbx6fdWQv'
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

    fcm:{
        topics: [],
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

    runes: [
        {
            quote: 'NR Donates 10% of all Income to Non-Profit Organisations Across the World!',
            author: 'NygmaRose'
        }, {
            quote: 'At NR We Make All Our Apps Open Source and Available to All. You Can See Our Projects at Github.com/NygmaRose.',
            author: 'NygmaRose'
        }, {
            quote: 'NR Has a Goal to Help the World. At NR We Strive to Partner and Promote as Many Non-Profit Organisations as We Can. Tweet Us Some to Explore New Opportunities!',
            author: 'NygmaRose'
        }
    ]
};