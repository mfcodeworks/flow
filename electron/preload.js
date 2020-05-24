const { contextBridge, ipcRenderer } = require('electron')
const {
    START_NOTIFICATION_SERVICE,
    NOTIFICATION_SERVICE_STARTED,
    NOTIFICATION_SERVICE_ERROR,
    NOTIFICATION_RECEIVED,
    TOKEN_UPDATED,
} = require('electron-push-receiver/src/constants');
const path = require('path');

// Include capacitor preload script
require(path.join(__dirname, 'node_modules', '@capacitor', 'electron', 'dist', 'electron-bridge.js'));

// Add custom API
contextBridge.exposeInMainWorld('push', {
    // Start push service
    start: token => typeof token === 'string' && ipcRenderer.send(START_NOTIFICATION_SERVICE, token),

    // Handle push registration
    onStart: callback => ipcRenderer.on(NOTIFICATION_SERVICE_STARTED, callback),

    // Handle push errors
    onError: callback => ipcRenderer.on(NOTIFICATION_SERVICE_ERROR, callback),

    // Send token to backend when updated
    onTokenUpdated: callback => ipcRenderer.on(TOKEN_UPDATED, callback),

    // Display notification
    onNotification: callback => ipcRenderer.on(NOTIFICATION_RECEIVED, callback)
});