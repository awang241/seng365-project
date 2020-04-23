const db = require('../../config/db');

exports.findByEmail = async function(email) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT * FROM User WHERE email = ?';
    const [result] = await conn.query(query, [email]);
    conn.release();
    return result;
};

exports.findById = async function(id) {
    const conn = await db.getPool().getConnection();
    const query = "SELECT * FROM User WHERE user_id = ?";
    const [result] = await conn.query(query, [id]);
    conn.release();
    return result;
};

exports.findByToken = async function(token) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT * FROM User WHERE auth_token = ?';
    const [result] = await conn.query(query, [token]);
    conn.release();
    return result;
};

exports.getToken = async function(user_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT auth_token FROM User WHERE user_id = ?';
    const [result] = await conn.query(query, [user_id]);
    conn.release();
    return result;
};

exports.setToken = async function(user_id, token) {
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET auth_token = ? WHERE user_id = ?';
    await conn.query(query, [token, user_id]);
    conn.release();
};

exports.clearToken = async function(user_id) {
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE User SET auth_token = NULL WHERE user_id = ?';
    await conn.query(query, [user_id]);
    conn.release();
};

exports.insert = async function(name, email, password, city, country) {
    const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO User (name, email, password, city, country) VALUES (?, ?, ?, ?, ?)';
    await conn.query(query, [name, email, password, city, country]);
    conn.release();
};

exports.alter = async function() {

};