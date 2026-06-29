import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

// PostgreSQL Connection Pool Setup
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/pdfmaster',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Mock In-Memory Database for local development fallback
class MockDB {
  public users: any[] = [
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

  public subscriptions: any[] = [
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

  public folders: any[] = [];
  public documents: any[] = [];
  public document_tags: any[] = [];
  public ocr_logs: any[] = [];
  public activity_logs: any[] = [];
  public support_tickets: any[] = [];
}

export const mockDb = new MockDB();
export let isUsingMock = false;

// Test Connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.warn('⚠️ PostgreSQL connection failed. Falling back to Mock In-Memory Database.');
    isUsingMock = true;
  } else {
    console.log('✅ PostgreSQL Database connected successfully:', res.rows[0].now);
  }
});

export const query = async (text: string, params?: any[]) => {
  if (isUsingMock) {
    // Basic mock query router (very simple support for fallback queries)
    console.log(`[MockDB Query] ${text} | params:`, params);
    if (text.includes('SELECT * FROM users WHERE email =')) {
      const email = params?.[0];
      const user = mockDb.users.find(u => u.email === email);
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
      mockDb.users.push(newUser);
      // Create a default free subscription
      mockDb.subscriptions.push({
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
      const sub = mockDb.subscriptions.find(s => s.user_id === userId);
      return { rows: sub ? [sub] : [] };
    }
    if (text.includes('SELECT * FROM folders WHERE user_id =')) {
      const userId = params?.[0];
      const userFolders = mockDb.folders.filter(f => f.user_id === userId);
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
      mockDb.folders.push(newFolder);
      return { rows: [newFolder] };
    }
    if (text.includes('SELECT * FROM documents WHERE user_id =')) {
      const userId = params?.[0];
      // Exclude trashed files unless requested or simple list
      let userDocs = mockDb.documents.filter(d => d.user_id === userId && !d.is_trash);
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
      mockDb.documents.push(newDoc);
      return { rows: [newDoc] };
    }
    return { rows: [] };
  }
  return pool.query(text, params);
};

export default pool;
