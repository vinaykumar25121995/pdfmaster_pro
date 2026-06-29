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
Object.defineProperty(exports, "__esModule", { value: true });
exports.query = exports.isUsingMock = exports.mockDb = void 0;
const pg_1 = require("pg");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// PostgreSQL Connection Pool Setup
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pdfmaster',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});
// Mock In-Memory Database for local development fallback
class MockDB {
    users = [
        {
            id: 'mock-admin-uuid',
            email: 'admin@pdfmaster.com',
            password_hash: '$2a$10$R9hGYGVB9vjhHLtM./5Aeux4.nO2C2CezW/4nZthdD6cK3tL7Xk8S', // bcrypt for 'admin123'
            first_name: 'Platform',
            last_name: 'Admin',
            role: 'admin',
            created_at: new Date(),
        },
        {
            id: 'mock-user-uuid',
            email: 'user@pdfmaster.com',
            password_hash: '$2a$10$R9hGYGVB9vjhHLtM./5Aeux4.nO2C2CezW/4nZthdD6cK3tL7Xk8S', // bcrypt for 'admin123'
            first_name: 'John',
            last_name: 'Doe',
            role: 'user',
            created_at: new Date(),
        }
    ];
    subscriptions = [
        {
            id: 'sub-1',
            user_id: 'mock-admin-uuid',
            plan_type: 'business',
            status: 'active',
            current_period_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        },
        {
            id: 'sub-2',
            user_id: 'mock-user-uuid',
            plan_type: 'free',
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        }
    ];
    folders = [];
    documents = [];
    document_tags = [];
    ocr_logs = [];
    activity_logs = [];
    support_tickets = [];
}
exports.mockDb = new MockDB();
exports.isUsingMock = false;
// Test Connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.warn('⚠️ PostgreSQL connection failed. Falling back to Mock In-Memory Database.');
        exports.isUsingMock = true;
    }
    else {
        console.log('✅ PostgreSQL Database connected successfully:', res.rows[0].now);
    }
});
const query = async (text, params) => {
    if (exports.isUsingMock) {
        // Basic mock query router (very simple support for fallback queries)
        console.log(`[MockDB Query] ${text} | params:`, params);
        if (text.includes('SELECT * FROM users WHERE email =')) {
            const email = params?.[0];
            const user = exports.mockDb.users.find(u => u.email === email);
            return { rows: user ? [user] : [] };
        }
        if (text.includes('INSERT INTO users')) {
            const newUser = {
                id: `user-${Date.now()}`,
                email: params?.[0],
                password_hash: params?.[1],
                first_name: params?.[2] || '',
                last_name: params?.[3] || '',
                role: 'user',
                created_at: new Date(),
            };
            exports.mockDb.users.push(newUser);
            // Create a default free subscription
            exports.mockDb.subscriptions.push({
                id: `sub-${Date.now()}`,
                user_id: newUser.id,
                plan_type: 'free',
                status: 'active',
                current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            });
            return { rows: [newUser] };
        }
        if (text.includes('SELECT * FROM subscriptions WHERE user_id =')) {
            const userId = params?.[0];
            const sub = exports.mockDb.subscriptions.find(s => s.user_id === userId);
            return { rows: sub ? [sub] : [] };
        }
        if (text.includes('SELECT * FROM folders WHERE user_id =')) {
            const userId = params?.[0];
            const userFolders = exports.mockDb.folders.filter(f => f.user_id === userId);
            return { rows: userFolders };
        }
        if (text.includes('INSERT INTO folders')) {
            const newFolder = {
                id: `folder-${Date.now()}`,
                user_id: params?.[0],
                name: params?.[1],
                parent_folder_id: params?.[2] || null,
                created_at: new Date(),
            };
            exports.mockDb.folders.push(newFolder);
            return { rows: [newFolder] };
        }
        if (text.includes('SELECT * FROM documents WHERE user_id =')) {
            const userId = params?.[0];
            // Exclude trashed files unless requested or simple list
            let userDocs = exports.mockDb.documents.filter(d => d.user_id === userId && !d.is_trash);
            return { rows: userDocs };
        }
        if (text.includes('INSERT INTO documents')) {
            const newDoc = {
                id: `doc-${Date.now()}`,
                user_id: params?.[0],
                filename: params?.[1],
                file_path: params?.[2],
                file_size: params?.[3],
                mime_type: params?.[4],
                folder_id: params?.[5] || null,
                is_favorite: false,
                is_trash: false,
                created_at: new Date(),
            };
            exports.mockDb.documents.push(newDoc);
            return { rows: [newDoc] };
        }
        return { rows: [] };
    }
    return pool.query(text, params);
};
exports.query = query;
exports.default = pool;
