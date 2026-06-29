"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeTag = exports.addTag = exports.deleteDocumentPermanently = exports.updateDocumentStatus = exports.uploadDocument = exports.listDocuments = exports.deleteFolder = exports.createFolder = exports.listFolders = void 0;
const db_1 = require("../db");
const listFolders = async (req, res) => {
    const userId = req.user?.id;
    try {
        const folders = await (0, db_1.query)('SELECT * FROM folders WHERE user_id = $1 ORDER BY name ASC', [userId]);
        return res.json(folders.rows);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to retrieve folders' });
    }
};
exports.listFolders = listFolders;
const createFolder = async (req, res) => {
    const userId = req.user?.id;
    const { name, parentFolderId } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'Folder name is required' });
    }
    try {
        const result = await (0, db_1.query)('INSERT INTO folders (user_id, name, parent_folder_id) VALUES ($1, $2, $3) RETURNING *', [userId, name, parentFolderId || null]);
        return res.status(201).json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to create folder' });
    }
};
exports.createFolder = createFolder;
const deleteFolder = async (req, res) => {
    const userId = req.user?.id;
    const { folderId } = req.params;
    try {
        if (db_1.isUsingMock) {
            db_1.mockDb.folders = db_1.mockDb.folders.filter(f => !(f.id === folderId && f.user_id === userId));
        }
        else {
            await (0, db_1.query)('DELETE FROM folders WHERE id = $1 AND user_id = $2', [folderId, userId]);
        }
        return res.json({ message: 'Folder deleted successfully' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete folder' });
    }
};
exports.deleteFolder = deleteFolder;
const listDocuments = async (req, res) => {
    const userId = req.user?.id;
    const { folderId, isFavorite, isTrash } = req.query;
    try {
        if (db_1.isUsingMock) {
            let docs = db_1.mockDb.documents.filter(d => d.user_id === userId);
            if (isFavorite === 'true') {
                docs = docs.filter(d => d.is_favorite);
            }
            if (isTrash === 'true') {
                docs = docs.filter(d => d.is_trash);
            }
            else {
                docs = docs.filter(d => !d.is_trash);
            }
            if (folderId) {
                docs = docs.filter(d => d.folder_id === folderId);
            }
            return res.json(docs);
        }
        let sql = 'SELECT d.*, array_remove(array_agg(t.tag_name), NULL) as tags FROM documents d LEFT JOIN document_tags t ON d.id = t.document_id WHERE d.user_id = $1';
        const params = [userId];
        if (isFavorite === 'true') {
            sql += ' AND d.is_favorite = TRUE';
        }
        if (isTrash === 'true') {
            sql += ' AND d.is_trash = TRUE';
        }
        else {
            sql += ' AND d.is_trash = FALSE';
        }
        if (folderId) {
            params.push(folderId);
            sql += ` AND d.folder_id = $${params.length}`;
        }
        sql += ' GROUP BY d.id ORDER BY d.updated_at DESC';
        const result = await (0, db_1.query)(sql, params);
        return res.json(result.rows);
    }
    catch (error) {
        console.error('List documents error:', error);
        return res.status(500).json({ error: 'Failed to retrieve documents' });
    }
};
exports.listDocuments = listDocuments;
const uploadDocument = async (req, res) => {
    const userId = req.user?.id;
    const file = req.file;
    const { folderId } = req.body;
    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    try {
        const result = await (0, db_1.query)('INSERT INTO documents (user_id, filename, file_path, file_size, mime_type, folder_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *', [userId, file.originalname, file.path, file.size, file.mimetype, folderId || null]);
        const newDoc = result.rows[0];
        return res.status(201).json({
            message: 'Document uploaded successfully',
            document: {
                ...newDoc,
                tags: []
            }
        });
    }
    catch (error) {
        console.error('Upload document error:', error);
        return res.status(500).json({ error: 'Failed to upload document' });
    }
};
exports.uploadDocument = uploadDocument;
const updateDocumentStatus = async (req, res) => {
    const userId = req.user?.id;
    const { docId } = req.params;
    const { isFavorite, isTrash, folderId, filename } = req.body;
    try {
        if (db_1.isUsingMock) {
            const doc = db_1.mockDb.documents.find(d => d.id === docId && d.user_id === userId);
            if (!doc)
                return res.status(404).json({ error: 'Document not found' });
            if (isFavorite !== undefined)
                doc.is_favorite = isFavorite;
            if (isTrash !== undefined)
                doc.is_trash = isTrash;
            if (folderId !== undefined)
                doc.folder_id = folderId;
            if (filename !== undefined)
                doc.filename = filename;
            doc.updated_at = new Date();
            return res.json(doc);
        }
        const updates = [];
        const params = [docId, userId];
        if (isFavorite !== undefined) {
            params.push(isFavorite);
            updates.push(`is_favorite = $${params.length}`);
        }
        if (isTrash !== undefined) {
            params.push(isTrash);
            updates.push(`is_trash = $${params.length}`);
        }
        if (folderId !== undefined) {
            params.push(folderId);
            updates.push(`folder_id = $${params.length}`);
        }
        if (filename !== undefined) {
            params.push(filename);
            updates.push(`filename = $${params.length}`);
        }
        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields provided to update' });
        }
        params.push(new Date());
        updates.push(`updated_at = $${params.length}`);
        const sql = `UPDATE documents SET ${updates.join(', ')} WHERE id = $1 AND user_id = $2 RETURNING *`;
        const result = await (0, db_1.query)(sql, params);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Document not found' });
        }
        return res.json(result.rows[0]);
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to update document status' });
    }
};
exports.updateDocumentStatus = updateDocumentStatus;
const deleteDocumentPermanently = async (req, res) => {
    const userId = req.user?.id;
    const { docId } = req.params;
    try {
        if (db_1.isUsingMock) {
            db_1.mockDb.documents = db_1.mockDb.documents.filter(d => !(d.id === docId && d.user_id === userId));
        }
        else {
            await (0, db_1.query)('DELETE FROM documents WHERE id = $1 AND user_id = $2', [docId, userId]);
        }
        return res.json({ message: 'Document deleted permanently' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to delete document permanently' });
    }
};
exports.deleteDocumentPermanently = deleteDocumentPermanently;
const addTag = async (req, res) => {
    const { docId } = req.params;
    const { tag } = req.body;
    if (!tag) {
        return res.status(400).json({ error: 'Tag name is required' });
    }
    try {
        if (db_1.isUsingMock) {
            db_1.mockDb.document_tags.push({ id: `tag-${Date.now()}`, document_id: docId, tag_name: tag });
        }
        else {
            await (0, db_1.query)('INSERT INTO document_tags (document_id, tag_name) VALUES ($1, $2) ON CONFLICT DO NOTHING', [docId, tag]);
        }
        return res.status(201).json({ message: 'Tag added successfully', tag });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to add tag' });
    }
};
exports.addTag = addTag;
const removeTag = async (req, res) => {
    const { docId, tag } = req.params;
    try {
        if (db_1.isUsingMock) {
            db_1.mockDb.document_tags = db_1.mockDb.document_tags.filter(t => !(t.document_id === docId && t.tag_name === tag));
        }
        else {
            await (0, db_1.query)('DELETE FROM document_tags WHERE document_id = $1 AND tag_name = $2', [docId, tag]);
        }
        return res.json({ message: 'Tag removed successfully' });
    }
    catch (error) {
        return res.status(500).json({ error: 'Failed to remove tag' });
    }
};
exports.removeTag = removeTag;
