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

exports.checkTokenExists = async function (token) {
    let result = await exports.findByToken(token);
    return result.length > 0;
};

exports.authenticateToken = async function (token, user_id) {
    let actual = await exports.getToken(user_id);
    if (actual.length === 0) {
        return false;
    } else {
        return actual[0].auth_token === token;
    }
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
    const result = await conn.query('SELECT LAST_INSERT_ID()');
    conn.release();
    return result[0][0]['LAST_INSERT_ID()'];
};

exports.alter = async function(id, name, email, password, city, country) {
    const conn = await db.getPool().getConnection();
    let query = 'UPDATE User SET name = name ';
    let params = [];
    if (name !== undefined) {
        query += ', name = ? ';
        params.push(name);
    }
    if (email !== undefined) {
        query += ', email = ? ';
        params.push(email);
    }
    if (password !== undefined) {
        query += ', password = ? ';
        params.push(password);
    }
    if (city !== undefined) {
        query += ', city = ? ';
        params.push(city);
    }
    if (country !== undefined) {
        query += ', country = ? ';
        params.push(country);
    }
    query += ' WHERE user_id = ?';
    params.push(id);
    await conn.query(query, params);
    conn.release();
};