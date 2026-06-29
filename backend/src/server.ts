import express from 'express';
import cors from 'cors';
import multer from 'multer';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

import { authenticateToken, requireAdmin } from './middleware/auth';
import * as authCtrl from './controllers/auth.controller';
import * as docCtrl from './controllers/document.controller';
import * as aiCtrl from './controllers/ai.controller';
import * as utilCtrl from './controllers/utility.controller';
import * as adminCtrl from './controllers/admin.controller';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable JSON parse and CORS
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Setup file upload directory
const uploadDir = path.join(__dirname, '../temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB Max File Size
});

// Authentication Routes
app.post('/api/auth/register', authCtrl.register);
app.post('/api/auth/login', authCtrl.login);
app.post('/api/auth/verify-otp', authCtrl.verifyOtp);
app.post('/api/auth/forgot-password', authCtrl.requestPasswordReset);
app.post('/api/auth/reset-password', authCtrl.resetPassword);
app.post('/api/auth/oauth', authCtrl.oauthMock);

// Document Library Routes
app.get('/api/documents', authenticateToken, docCtrl.listDocuments);
app.post('/api/documents/upload', authenticateToken, upload.single('file'), docCtrl.uploadDocument);
app.put('/api/documents/:docId', authenticateToken, docCtrl.updateDocumentStatus);
app.delete('/api/documents/:docId', authenticateToken, docCtrl.deleteDocumentPermanently);

// Folders Routes
app.get('/api/folders', authenticateToken, docCtrl.listFolders);
app.post('/api/folders', authenticateToken, docCtrl.createFolder);
app.delete('/api/folders/:folderId', authenticateToken, docCtrl.deleteFolder);

// Document Tags Routes
app.post('/api/documents/:docId/tags', authenticateToken, docCtrl.addTag);
app.delete('/api/documents/:docId/tags/:tag', authenticateToken, docCtrl.removeTag);

// AI Document Assistant Routes
app.post('/api/ai/chat', authenticateToken, aiCtrl.chatWithDocument);
app.post('/api/ai/summarize', authenticateToken, aiCtrl.summarizeDocument);
app.post('/api/ai/extract', authenticateToken, aiCtrl.extractEntity);

// PDF Utilities Routes
app.post('/api/utility/merge', authenticateToken, upload.array('files', 15), utilCtrl.mergePDFs);
app.post('/api/utility/split', authenticateToken, upload.single('file'), utilCtrl.splitPDF);
app.post('/api/utility/compress', authenticateToken, upload.single('file'), utilCtrl.compressPDF);
app.post('/api/utility/watermark', authenticateToken, upload.single('file'), utilCtrl.watermarkPDF);
app.post('/api/utility/manage-pages', authenticateToken, upload.single('file'), utilCtrl.managePages);
app.post('/api/utility/convert', authenticateToken, upload.single('file'), utilCtrl.convertFormat);
app.get('/api/utility/download', utilCtrl.downloadTempFile);

// Admin Control Panel Routes
app.get('/api/admin/stats', authenticateToken, requireAdmin, adminCtrl.getDashboardStats);
app.get('/api/admin/users', authenticateToken, requireAdmin, adminCtrl.listUsers);
app.put('/api/admin/subscriptions', authenticateToken, requireAdmin, adminCtrl.updateUserSubscription);
app.get('/api/admin/tickets', authenticateToken, requireAdmin, adminCtrl.listSupportTickets);
app.put('/api/admin/tickets/:ticketId', authenticateToken, requireAdmin, adminCtrl.updateTicketStatus);

// API Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 PDFMaster Pro API Server is running on port ${PORT}`);
});

export default app;
