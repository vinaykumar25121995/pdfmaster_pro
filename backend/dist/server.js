"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const multer_1 = __importDefault(require("multer"));
const dotenv = __importStar(require("dotenv"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const auth_1 = require("./middleware/auth");
const authCtrl = __importStar(require("./controllers/auth.controller"));
const docCtrl = __importStar(require("./controllers/document.controller"));
const aiCtrl = __importStar(require("./controllers/ai.controller"));
const utilCtrl = __importStar(require("./controllers/utility.controller"));
const adminCtrl = __importStar(require("./controllers/admin.controller"));
dotenv.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// Enable JSON parse and CORS
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Setup file upload directory
const uploadDir = path.join(__dirname, '../temp');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}
// Multer Storage Setup
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({
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
app.get('/api/documents', auth_1.authenticateToken, docCtrl.listDocuments);
app.post('/api/documents/upload', auth_1.authenticateToken, upload.single('file'), docCtrl.uploadDocument);
app.put('/api/documents/:docId', auth_1.authenticateToken, docCtrl.updateDocumentStatus);
app.delete('/api/documents/:docId', auth_1.authenticateToken, docCtrl.deleteDocumentPermanently);
// Folders Routes
app.get('/api/folders', auth_1.authenticateToken, docCtrl.listFolders);
app.post('/api/folders', auth_1.authenticateToken, docCtrl.createFolder);
app.delete('/api/folders/:folderId', auth_1.authenticateToken, docCtrl.deleteFolder);
// Document Tags Routes
app.post('/api/documents/:docId/tags', auth_1.authenticateToken, docCtrl.addTag);
app.delete('/api/documents/:docId/tags/:tag', auth_1.authenticateToken, docCtrl.removeTag);
// AI Document Assistant Routes
app.post('/api/ai/chat', auth_1.authenticateToken, aiCtrl.chatWithDocument);
app.post('/api/ai/summarize', auth_1.authenticateToken, aiCtrl.summarizeDocument);
app.post('/api/ai/extract', auth_1.authenticateToken, aiCtrl.extractEntity);
// PDF Utilities Routes
app.post('/api/utility/merge', auth_1.authenticateToken, upload.array('files', 15), utilCtrl.mergePDFs);
app.post('/api/utility/split', auth_1.authenticateToken, upload.single('file'), utilCtrl.splitPDF);
app.post('/api/utility/compress', auth_1.authenticateToken, upload.single('file'), utilCtrl.compressPDF);
app.post('/api/utility/watermark', auth_1.authenticateToken, upload.single('file'), utilCtrl.watermarkPDF);
app.post('/api/utility/manage-pages', auth_1.authenticateToken, upload.single('file'), utilCtrl.managePages);
app.post('/api/utility/convert', auth_1.authenticateToken, upload.single('file'), utilCtrl.convertFormat);
app.get('/api/utility/download', utilCtrl.downloadTempFile);
// Admin Control Panel Routes
app.get('/api/admin/stats', auth_1.authenticateToken, auth_1.requireAdmin, adminCtrl.getDashboardStats);
app.get('/api/admin/users', auth_1.authenticateToken, auth_1.requireAdmin, adminCtrl.listUsers);
app.put('/api/admin/subscriptions', auth_1.authenticateToken, auth_1.requireAdmin, adminCtrl.updateUserSubscription);
app.get('/api/admin/tickets', auth_1.authenticateToken, auth_1.requireAdmin, adminCtrl.listSupportTickets);
app.put('/api/admin/tickets/:ticketId', auth_1.authenticateToken, auth_1.requireAdmin, adminCtrl.updateTicketStatus);
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
exports.default = app;
