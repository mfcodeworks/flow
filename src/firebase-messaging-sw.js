// Give the service worker access to Firebase Messaging.
// Note that you can only use Firebase Messaging here, other Firebase libraries
// are not available in the service worker.
importScripts('https://www.gstatic.com/firebasejs/7.10.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/7.10.0/firebase-messaging.js');

// Initialize the Firebase app in the service worker by passing in the
// messagingSenderId.
firebase.initializeApp({
    apiKey: "AIzaSyAIrCRt4FSgS4DMUTZj2xUMMSymAtCq0Wk",
    authDomain: "nr-wallet-5e82a.firebaseapp.com",
    databaseURL: "https://nr-wallet-5e82a.firebaseio.com",
    projectId: "nr-wallet-5e82a",
    storageBucket: "nr-wallet-5e82a.appspot.com",
    messagingSenderId: "427082487138",
    appId: "1:427082487138:web:698543e31791e68601083b",
    measurementId: "G-7C9PRZ0J72"
});

// Retrieve an instance of Firebase Messaging so that it can handle background
// messages.
const messaging = firebase.messaging();