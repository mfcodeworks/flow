// @ts-nocheck
const {
  app,
  BrowserWindow,
  Menu,
  Tray
} = require('electron');
const isDevMode = require('electron-is-dev');
const { CapacitorSplashScreen, configCapacitor } = require('@capacitor/electron');
const { setup: setupPushReceiver } = require('electron-push-receiver');

const path = require('path');

// Place holders for our windows so they don't get garbage collected.
let mainWindow = null;

// Placeholder for SplashScreen ref
let splashScreen = null;

// Placeholder for Tray ref
let tray = null;

// Placeholder for quitting
let quitting = false;

// Change this if you do not wish to have a splash screen
let useSplashScreen = true;

// Create simple menu for easy devtools access, and for demo
const menuTemplateDev = [{
  label: 'Options',
  submenu: [
    {
      label: 'Open Dev Tools',
      click() {
        mainWindow.openDevTools();
      },
    },
  ],
}];

// Create tray menu
const contextMenu = Menu.buildFromTemplate([{
  label: 'Open',
  click: () => mainWindow.show()
}, {
  label: 'Quit',
  click: () => {
    quitting = true;
    app.quit();
  }
}])

// Set icon
const icon = path.join(__dirname, 'app', 'assets', 'icons', 'icon-512x512.png');

async function createWindow () {
  // Define our main window size
  mainWindow = new BrowserWindow({
    height: 920,
    width: 1600,
    show: false,
    icon: icon,
    title: 'Flow',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  // Do setups
  configCapacitor(mainWindow);
  setupPushReceiver(mainWindow.webContents);

  // Set tray icon
  tray = new Tray(icon);
  tray.setToolTip('Flow');
  tray.setContextMenu(contextMenu);
  tray.setIgnoreDoubleClickEvents(true);
  tray.on('click', _ =>
      mainWindow.isVisible()
        ? mainWindow.hide()
        : mainWindow.show()
  );

  // Set our above template to the Menu Object if we are in development mode, dont want users having the devtools.
  if (isDevMode) {
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplateDev));
    mainWindow.webContents.openDevTools();
  }

  if(useSplashScreen) {
    splashScreen = new CapacitorSplashScreen(mainWindow);
    splashScreen.init();
  } else {
    mainWindow.loadURL(`file://${__dirname}/app/index.html`);
    mainWindow.webContents.on('dom-ready', () => {
      mainWindow.webContents.send('window-id', mainWindow.id);
      mainWindow.show();
    });
  }

  mainWindow.on('minimize', (e) => {
    e.preventDefault();
    mainWindow.hide();
  });

  // Emitted when the window is closed.
  mainWindow.on('close', (e) => {
    if (!quitting) {
      e.preventDefault();
      mainWindow.hide();
    }

    return false;
  });

}

// Force single instance
if (!app.requestSingleInstanceLock() || require('electron-squirrel-startup')) {
  app.quit();
}

app.on('second-instance', (event, argv, cwd) => {
  if (mainWindow) {
    mainWindow.show();

    if (mainWindow.isMinimized())
      mainWindow.restore();

    mainWindow.focus();
  }
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some Electron APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Remove menu from all new windows including modals
app.on('browser-window-created', (e,window) => {
  window.removeMenu();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

// Configure auto-update
require('update-electron-app')();