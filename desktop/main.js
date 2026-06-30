const { app, BrowserWindow, ipcMain, Notification, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "PDFMaster Pro Desktop",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  // In production, we load the Next.js production build: dist/index.html
  // In development, we load the local live server
  const startUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://pdfmaster-pro.vercel.app';

  mainWindow.loadURL(startUrl);

  // Open DevTools in development mode
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Setup Native Menu
const template = [
  {
    label: 'File',
    submenu: [
      { label: 'Open Local PDF...', click: () => { mainWindow.webContents.send('trigger-open-pdf'); } },
      { label: 'Save As...', click: () => { mainWindow.webContents.send('trigger-save-pdf'); } },
      { type: 'separator' },
      { role: 'quit' }
    ]
  },
  {
    label: 'Edit',
    submenu: [
      { role: 'undo' },
      { role: 'redo' },
      { type: 'separator' },
      { role: 'cut' },
      { role: 'copy' },
      { role: 'paste' }
    ]
  },
  {
    label: 'View',
    submenu: [
      { role: 'reload' },
      { role: 'toggleDevTools' },
      { type: 'separator' },
      { role: 'resetZoom' },
      { role: 'zoomIn' },
      { role: 'zoomOut' },
      { type: 'separator' },
      { role: 'togglefullscreen' }
    ]
  },
  {
    label: 'Help',
    submenu: [
      {
        label: 'Check for Updates...',
        click: () => {
          autoUpdater.checkForUpdatesAndNotify();
        }
      },
      {
        label: 'About PDFMaster Pro',
        click: () => {
          const { dialog } = require('electron');
          dialog.showMessageBox({
            type: 'info',
            title: 'About PDFMaster Pro',
            message: 'PDFMaster Pro Desktop Shell v2.0.4\nPowered by WebAssembly and Electron.\n© 2026 PDFMaster Pro Inc.',
            buttons: ['OK']
          });
        }
      }
    ]
  }
];

app.on('ready', () => {
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  createWindow();

  // Trigger Auto Update check
  autoUpdater.checkForUpdatesAndNotify();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

// IPC communication triggers for offline file caches and actions
ipcMain.handle('read-local-file', async (event, filePath) => {
  try {
    const data = fs.readFileSync(filePath);
    return { success: true, data: data.toString('base64') };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle('write-local-file', async (event, { filePath, contentBase64 }) => {
  try {
    const buffer = Buffer.from(contentBase64, 'base64');
    fs.writeFileSync(filePath, buffer);
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.on('show-desktop-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body }).show();
  }
});

// AutoUpdater events logging
autoUpdater.on('update-available', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-status', 'Update available. Downloading in background...');
  }
});

autoUpdater.on('update-downloaded', () => {
  if (mainWindow) {
    mainWindow.webContents.send('update-status', 'Update ready to install. Restart application.');
  }
});
