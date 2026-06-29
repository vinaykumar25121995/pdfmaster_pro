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
exports.oauthMock = exports.resetPassword = exports.requestPasswordReset = exports.verifyOtp = exports.login = exports.register = void 0;
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const db_1 = require("../db");
const JWT_SECRET = process.env.JWT_SECRET || 'pdfmaster-pro-secret-key-123456';
const register = async (req, res) => {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        // Check if user already exists
        const checkUser = await (0, db_1.query)('SELECT * FROM users WHERE email = $1', [email]);
        if (checkUser.rows.length > 0) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const result = await (0, db_1.query)('INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, role', [email, passwordHash, firstName || '', lastName || '']);
        const user = result.rows[0];
        // Auto-create active Free subscription in live DB
        if (!db_1.isUsingMock) {
            await (0, db_1.query)('INSERT INTO subscriptions (user_id, plan_type, status, current_period_end) VALUES ($1, $2, $3, $4)', [user.id, 'free', 'active', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]);
        }
        // Generate Token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(201).json({
            message: 'Registration successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                plan: 'free'
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error during registration' });
    }
};
exports.register = register;
const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }
    try {
        const result = await (0, db_1.query)('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        // Get active subscription
        const subResult = await (0, db_1.query)('SELECT * FROM subscriptions WHERE user_id = $1', [user.id]);
        const plan = subResult.rows.length > 0 ? subResult.rows[0].plan_type : 'free';
        // Generate Token
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                plan
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error during login' });
    }
};
exports.login = login;
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        return res.status(400).json({ error: 'Email and OTP are required' });
    }
    // Mock validation for demo/dev speed
    if (otp === '123456' || otp === '888888') {
        return res.json({ message: 'OTP verified successfully' });
    }
    return res.status(400).json({ error: 'Invalid OTP or code expired' });
};
exports.verifyOtp = verifyOtp;
const requestPasswordReset = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    // Log request password reset
    return res.json({ message: 'Password reset code sent to email (use 888888 as mock code)' });
};
exports.requestPasswordReset = requestPasswordReset;
const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) {
        return res.status(400).json({ error: 'All fields are required' });
    }
    if (otp !== '888888') {
        return res.status(400).json({ error: 'Invalid reset code' });
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);
        if (db_1.isUsingMock) {
            const u = db_1.mockDb.users.find(x => x.email === email);
            if (u)
                u.password_hash = passwordHash;
        }
        else {
            await (0, db_1.query)('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email]);
        }
        return res.json({ message: 'Password has been reset successfully' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to reset password' });
    }
};
exports.resetPassword = resetPassword;
const oauthMock = async (req, res) => {
    const { email, firstName, lastName, provider } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email is required for OAuth login' });
    }
    try {
        let result = await (0, db_1.query)('SELECT * FROM users WHERE email = $1', [email]);
        let user;
        if (result.rows.length === 0) {
            // Create auto OAuth account
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(`oauth-pass-${Date.now()}`, salt);
            const insertResult = await (0, db_1.query)('INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, role', [email, passwordHash, firstName || 'Social', lastName || 'User']);
            user = insertResult.rows[0];
            if (!db_1.isUsingMock) {
                await (0, db_1.query)('INSERT INTO subscriptions (user_id, plan_type, status, current_period_end) VALUES ($1, $2, $3, $4)', [user.id, 'free', 'active', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]);
            }
        }
        else {
            user = result.rows[0];
        }
        const subResult = await (0, db_1.query)('SELECT * FROM subscriptions WHERE user_id = $1', [user.id]);
        const plan = subResult.rows.length > 0 ? subResult.rows[0].plan_type : 'free';
        const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
        return res.json({
            message: `Logged in via ${provider}`,
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.first_name,
                lastName: user.last_name,
                role: user.role,
                plan
            }
        });
    }
    catch (err) {
        return res.status(500).json({ error: 'OAuth connection failed' });
    }
};
exports.oauthMock = oauthMock;
