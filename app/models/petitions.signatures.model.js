const db = require('../../config/db');

function toSQLDatetime(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

exports.read = async function(petition_id) {
    console.log("Attempting to retrieve petition signatures from database");
    const conn = await db.getPool().getConnection();
    const query = 'SELECT signatory_id, name, city, country, signed_date ' +
                'FROM Signature JOIN User ON user_id = signatory_id WHERE petition_id = ? ORDER BY signed_date';
    const [result] = await conn.query(query, [petition_id]);
    conn.release();
    return result;
};

exports.haveSigned = async function(petition_id, user_id) {
    const conn = await db.getPool().getConnection();
    const query = 'SELECT * FROM Signature WHERE petition_id = ? and signatory_id = ?',
        params = [petition_id, user_id];
    const [result] = await conn.query(query, params);
    conn.release();
    return result.length > 0;
};

exports.insert = async function(petition_id, user_id) {
    console.log("Attempting to insert petition signatures into database");
    const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO Signature (petition_id, signatory_id, signed_date) VALUES (?, ?, ?)',
        params = [petition_id, user_id, toSQLDatetime(new Date(Date.now()))];
    const [result] = await conn.query(query, params);
    conn.release();
    return result;
};

exports.remove = async function(petition_id, user_id) {
    console.log("Attempting to delete petition signatures from database");
    const conn = await db.getPool().getConnection();
    const query = 'DELETE FROM Signature WHERE petition_id = ? and signatory_id = ?',
        params = [petition_id, user_id];
    const [result] = await conn.query(query, params);
    conn.release();
    return result;
};

