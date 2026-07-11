const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readLocalFile: (filePath) => ipcRenderer.invoke('read-local-file', filePath),
  writeLocalFile: (filePath, contentBase64) => ipcRenderer.invoke('write-local-file', { filePath, contentBase64 }),
  showNotification: (title, body) => ipcRenderer.send('show-desktop-notification', { title, body }),
  onOpenPdfTrigger: (callback) => ipcRenderer.on('trigger-open-pdf', callback),
  onSavePdfTrigger: (callback) => ipcRenderer.on('trigger-save-pdf', callback),
  onOpenExternalPdf: (callback) => ipcRenderer.on('open-external-pdf', (_event, data) => callback(data)),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', callback)
});
