const db = require('../../config/db');

exports.read = async function(petition_id) {
    console.log("Attempting to retrieve petition signatures from database");
    const conn = await db.getPool().getConnection();
    const query = 'SELECT signatory_id, name, city, country, signed_date ' +
                'FROM Signature JOIN User ON user_id = signatory_id WHERE petition_id = ?';
    const [result] = await conn.query(query, [petition_id]);
    conn.release();
    return result;
};

exports.insert = async function(petition_id, user_id) {

};

exports.remove = async function(petition_id, user_id) {

};

