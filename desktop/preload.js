const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  readLocalFile: (filePath) => ipcRenderer.invoke('read-local-file', filePath),
  writeLocalFile: (filePath, contentBase64) => ipcRenderer.invoke('write-local-file', { filePath, contentBase64 }),
  showNotification: (title, body) => ipcRenderer.send('show-desktop-notification', { title, body }),
  onOpenPdfTrigger: (callback) => ipcRenderer.on('trigger-open-pdf', callback),
  onSavePdfTrigger: (callback) => ipcRenderer.on('trigger-save-pdf', callback),
  onUpdateStatus: (callback) => ipcRenderer.on('update-status', callback)
});
