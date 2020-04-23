const db = require('../../config/db');
const fs = require('mz/fs');

exports.getPhotoFilename = async function(id) {
    console.log("Attempting to retrieve photo filename from database");
    const conn = await db.getPool().getConnection();
    const query = 'SELECT photo_filename FROM Petition WHERE petition_id = ?';
    const [result] = await conn.query(query, [id]);
    conn.release();
    return result;
};