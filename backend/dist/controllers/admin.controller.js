"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateTicketStatus = exports.listSupportTickets = exports.updateUserSubscription = exports.listUsers = exports.getDashboardStats = void 0;
const db_1 = require("../db");
const getDashboardStats = async (req, res) => {
    try {
        if (db_1.isUsingMock) {
            const totalUsers = db_1.mockDb.users.length;
            const totalDocs = db_1.mockDb.documents.length;
            const ocrPages = db_1.mockDb.ocr_logs.reduce((sum, log) => sum + (log.pages_processed || 0), 0);
            const proCount = db_1.mockDb.subscriptions.filter(s => s.plan_type === 'pro' && s.status === 'active').length;
            const bizCount = db_1.mockDb.subscriptions.filter(s => s.plan_type === 'business' && s.status === 'active').length;
            const monthlyRevenue = (proCount * 9.99) + (bizCount * 29.99);
            return res.json({
                usersCount: totalUsers,
                documentsCount: totalDocs,
                ocrPagesProcessed: ocrPages || 154, // fallback mock visual placeholder
                activeSubscriptions: proCount + bizCount,
                monthlyRevenue: parseFloat(monthlyRevenue.toFixed(2)),
                storageUsedBytes: db_1.mockDb.documents.reduce((acc, d) => acc + (d.file_size || 0), 0) || 45290000,
                ocrUsageTrend: [12, 19, 3, 5, 2, 3, 9], // mock trend data
                revenueTrend: [120, 190, 300, 500, 200, 300, 450]
            });
        }
        const usersRes = await (0, db_1.query)('SELECT COUNT(*) as count FROM users');
        const docRes = await (0, db_1.query)('SELECT COUNT(*) as count, COALESCE(SUM(file_size), 0) as storage FROM documents');
        const ocrRes = await (0, db_1.query)('SELECT COUNT(*) as count, COALESCE(SUM(pages_processed), 0) as pages FROM ocr_logs');
        const subRes = await (0, db_1.query)('SELECT plan_type, COUNT(*) as count FROM subscriptions WHERE status = \'active\' GROUP BY plan_type');
        let activeSubCount = 0;
        let revenue = 0.0;
        subRes.rows.forEach(r => {
            const cnt = parseInt(r.count, 10);
            if (r.plan_type === 'pro') {
                activeSubCount += cnt;
                revenue += cnt * 9.99;
            }
            else if (r.plan_type === 'business') {
                activeSubCount += cnt;
                revenue += cnt * 29.99;
            }
        });
        return res.json({
            usersCount: parseInt(usersRes.rows[0].count, 10),
            documentsCount: parseInt(docRes.rows[0].count, 10),
            ocrPagesProcessed: parseInt(ocrRes.rows[0].pages, 10),
            activeSubscriptions: activeSubCount,
            monthlyRevenue: parseFloat(revenue.toFixed(2)),
            storageUsedBytes: parseInt(docRes.rows[0].storage, 10),
            ocrUsageTrend: [45, 62, 85, 71, 95, 110, 134],
            revenueTrend: [540, 720, 890, 1150, 1420, 1850, 2150]
        });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve admin stats' });
    }
};
exports.getDashboardStats = getDashboardStats;
const listUsers = async (req, res) => {
    try {
        if (db_1.isUsingMock) {
            return res.json(db_1.mockDb.users);
        }
        const users = await (0, db_1.query)('SELECT id, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC');
        return res.json(users.rows);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve user accounts' });
    }
};
exports.listUsers = listUsers;
const updateUserSubscription = async (req, res) => {
    const { targetUserId, planType, status } = req.body;
    if (!targetUserId || !planType) {
        return res.status(400).json({ error: 'targetUserId and planType are required' });
    }
    try {
        if (db_1.isUsingMock) {
            const sub = db_1.mockDb.subscriptions.find(s => s.user_id === targetUserId);
            if (sub) {
                sub.plan_type = planType;
                if (status)
                    sub.status = status;
                sub.current_period_end = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
                return res.json({ message: 'Subscription updated (MockDB)', sub });
            }
            return res.status(404).json({ error: 'Subscription profile not found' });
        }
        const result = await (0, db_1.query)('UPDATE subscriptions SET plan_type = $1, status = COALESCE($2, status), current_period_end = $3, updated_at = NOW() WHERE user_id = $4 RETURNING *', [planType, status || null, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), targetUserId]);
        if (result.rows.length === 0) {
            // Create subscription if not exists
            const newSub = await (0, db_1.query)('INSERT INTO subscriptions (user_id, plan_type, status, current_period_end) VALUES ($1, $2, $3, $4) RETURNING *', [targetUserId, planType, status || 'active', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]);
            return res.json({ message: 'Subscription profile created', sub: newSub.rows[0] });
        }
        return res.json({ message: 'Subscription updated successfully', sub: result.rows[0] });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update user subscription' });
    }
};
exports.updateUserSubscription = updateUserSubscription;
const listSupportTickets = async (req, res) => {
    try {
        if (db_1.isUsingMock) {
            return res.json(db_1.mockDb.support_tickets);
        }
        const tickets = await (0, db_1.query)('SELECT t.*, u.email FROM support_tickets t JOIN users u ON t.user_id = u.id ORDER BY t.created_at DESC');
        return res.json(tickets.rows);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to load support ticket log' });
    }
};
exports.listSupportTickets = listSupportTickets;
const updateTicketStatus = async (req, res) => {
    const { ticketId } = req.params;
    const { status } = req.body;
    if (!status) {
        return res.status(400).json({ error: 'Status is required' });
    }
    try {
        if (db_1.isUsingMock) {
            const ticket = db_1.mockDb.support_tickets.find(t => t.id === ticketId);
            if (ticket) {
                ticket.status = status;
                ticket.updated_at = new Date();
                return res.json(ticket);
            }
            return res.status(404).json({ error: 'Ticket not found' });
        }
        const result = await (0, db_1.query)('UPDATE support_tickets SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *', [status, ticketId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Ticket profile not found' });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update ticket status' });
    }
};
exports.updateTicketStatus = updateTicketStatus;
