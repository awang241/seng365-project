const db = require('../../config/db');

exports.get = async function(id) {
    console.log("Attempting to retrieve photo filename from database");
    const conn = await db.getPool().getConnection();
    const query = 'SELECT photo_filename FROM Petition WHERE petition_id = ?';
    const [result] = await conn.query(query, [id]);
    conn.release();
    return result;
};

exports.set = async function(filename, id) {
    console.log("Attempting to set photo filename in database");
    const conn = await db.getPool().getConnection();
    const query = 'UPDATE Petition SET photo_filename = ? WHERE petition_id = ?';
    const [result] = await conn.query(query, [filename, id]);
    conn.release();
    return result;
};