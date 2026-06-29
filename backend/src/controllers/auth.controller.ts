import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { query, isUsingMock, mockDb } from '../db';

const JWT_SECRET = process.env.JWT_SECRET || 'pdfmaster-pro-secret-key-123456';

export const register = async (req: AuthenticatedRequest, res: Response) => {
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    // Check if user already exists
    const checkUser = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (checkUser.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, role',
      [email, passwordHash, firstName || '', lastName || '']
    );

    const user = result.rows[0];

    // Auto-create active Free subscription in live DB
    if (!isUsingMock) {
      await query(
        'INSERT INTO subscriptions (user_id, plan_type, status, current_period_end) VALUES ($1, $2, $3, $4)',
        [user.id, 'free', 'active', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
      );
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
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const login = async (req: AuthenticatedRequest, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Get active subscription
    const subResult = await query('SELECT * FROM subscriptions WHERE user_id = $1', [user.id]);
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
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const verifyOtp = async (req: AuthenticatedRequest, res: Response) => {
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

export const requestPasswordReset = async (req: AuthenticatedRequest, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }
  // Log request password reset
  return res.json({ message: 'Password reset code sent to email (use 888888 as mock code)' });
};

export const resetPassword = async (req: AuthenticatedRequest, res: Response) => {
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

    if (isUsingMock) {
      const u = mockDb.users.find(x => x.email === email);
      if (u) u.password_hash = passwordHash;
    } else {
      await query('UPDATE users SET password_hash = $1 WHERE email = $2', [passwordHash, email]);
    }

    return res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to reset password' });
  }
};

export const oauthMock = async (req: AuthenticatedRequest, res: Response) => {
  const { email, firstName, lastName, provider } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required for OAuth login' });
  }

  try {
    let result = await query('SELECT * FROM users WHERE email = $1', [email]);
    let user;

    if (result.rows.length === 0) {
      // Create auto OAuth account
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(`oauth-pass-${Date.now()}`, salt);

      const insertResult = await query(
        'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, role',
        [email, passwordHash, firstName || 'Social', lastName || 'User']
      );
      user = insertResult.rows[0];

      if (!isUsingMock) {
        await query(
          'INSERT INTO subscriptions (user_id, plan_type, status, current_period_end) VALUES ($1, $2, $3, $4)',
          [user.id, 'free', 'active', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
        );
      }
    } else {
      user = result.rows[0];
    }

    const subResult = await query('SELECT * FROM subscriptions WHERE user_id = $1', [user.id]);
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
  } catch (err) {
    return res.status(500).json({ error: 'OAuth connection failed' });
  }
};
