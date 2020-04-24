const db = require('../../config/db');

exports.get = async function(id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT photo_filename FROM User WHERE petition_id = ?';
    const [result] = await conn.query(query, [id]);
    conn.release();
    return result;
};

exports.alter = async function(id, filename) {
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET photo_filename = ? WHERE user_id = ?';
    const [result] = await conn.query(query, [filename, id]);
    conn.release();
    return result;
};

exports.clear = async function(id) {
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET photo_filename = NULL WHERE user_id = ?';
    const [result] = await conn.query(query, [id]);
    conn.release();
    return result;
};