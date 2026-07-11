const { app, BrowserWindow, ipcMain, Notification, Menu } = require('electron');
const path = require('path');
const fs = require('fs');
const { autoUpdater } = require('electron-updater');

let mainWindow;

const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
      handleCommandLineArgs(commandLine);
    }
  });
}

let pendingPdfPath = null;

function findPdfInArgs(args) {
  if (!args || !Array.isArray(args)) return null;
  for (const arg of args) {
    if (arg && typeof arg === 'string' && arg.toLowerCase().endsWith('.pdf') && fs.existsSync(arg)) {
      return arg;
    }
  }
  return null;
}

function handleCommandLineArgs(args) {
  const pdfArg = findPdfInArgs(args);
  if (pdfArg) {
    pendingPdfPath = pdfArg;
    injectPendingPdf();
  }
}

function injectPendingPdf() {
  if (!pendingPdfPath || !mainWindow || !mainWindow.webContents) return;
  try {
    const data = fs.readFileSync(pendingPdfPath);
    const base64Data = data.toString('base64');
    const fileName = path.basename(pendingPdfPath);

    const currentUrl = mainWindow.webContents.getURL();
    if (!currentUrl.includes('/dashboard/editor') && !currentUrl.includes('offline.html')) {
      const baseUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:3000' 
        : 'https://ilovepdfmaster.vercel.app';
      mainWindow.loadURL(`${baseUrl}/dashboard/editor`);
      return;
    }

    const script = `
      (function() {
        try {
          const base64 = "${base64Data}";
          const binaryString = atob(base64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          window.sharedPdfBuffer = bytes.buffer;
          window.sharedPdfName = "${fileName.replace(/"/g, '\\"')}";
          window.dispatchEvent(new CustomEvent('load-external-pdf'));
        } catch (e) {
          console.error('Error injecting PDF:', e);
        }
      })();
    `;
    mainWindow.webContents.executeJavaScript(script);
    mainWindow.webContents.send('open-external-pdf', {
      fileName,
      filePath: pendingPdfPath,
      base64Data
    });
    pendingPdfPath = null;
  } catch (err) {
    console.error('Error opening PDF file:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "PDFMaster Pro Desktop",
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  const initialPdf = findPdfInArgs(process.argv);
  if (initialPdf) {
    pendingPdfPath = initialPdf;
  }

  const baseUrl = process.env.NODE_ENV === 'development' 
    ? 'http://localhost:3000' 
    : 'https://ilovepdfmaster.vercel.app';

  const startUrl = pendingPdfPath ? `${baseUrl}/dashboard/editor` : baseUrl;

  mainWindow.loadURL(startUrl).catch(() => {
    mainWindow.loadFile(path.join(__dirname, 'offline.html'));
  });

  mainWindow.webContents.on('did-finish-load', () => {
    injectPendingPdf();
  });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    if (errorCode !== -3) {
      mainWindow.loadFile(path.join(__dirname, 'offline.html'));
    }
  });

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
