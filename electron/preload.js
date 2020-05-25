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

// Set IPC Event Handlers
ipcRenderer
    .on(NOTIFICATION_SERVICE_STARTED, (_, token) => window.postMessage({type:'push:start', token}, '*'))
    .on(NOTIFICATION_SERVICE_ERROR, (_, error) => window.postMessage({type:'push:error', error}, '*'))
    .on(TOKEN_UPDATED, (_, token) => window.postMessage({type:'push:updated', token}, '*'))
    .on(NOTIFICATION_RECEIVED, (_, notif) => window.postMessage({type:'push:notification', notif}, '*'))

// Add custom API
contextBridge.exposeInMainWorld('push', {
    // Start push service
    start: token => typeof token === 'string' && ipcRenderer.send(START_NOTIFICATION_SERVICE, token)
});