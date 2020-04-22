const db = require('../../config/db');
const fs = require('mz/fs');

exports.getAll = async function(author_id, category_id, pattern, sortBy){
    console.log("Attempting to retrieve petitions from database");

    const conn = await db.getPool().getConnection();
    const selectFieldsFrag = ' SELECT Petition.petition_id, title, author_id, AuthorNames.name AS author_name, ' +
        'C.category_id, C.name AS category_name, signature_count FROM Petition ';
    const joinSignaturesFrag = ' JOIN (SELECT petition_id, COUNT(*) AS signature_count FROM Signature GROUP BY petition_id) ' +
        'AS SigCounts ON Petition.petition_id = SigCounts.petition_id ';
    const joinAuthorsFrag =  ' JOIN (SELECT user_id, name FROM User) AS AuthorNames ON Petition.author_id = AuthorNames.user_id ';
    const joinCategoriesFrag =  ' JOIN Category C ON Petition.category_id = C.category_id WHERE 1 = 1 ';
    let query = selectFieldsFrag + joinSignaturesFrag + joinAuthorsFrag + joinCategoriesFrag;
    const params = [];

    if (author_id != null) {
        query += ' AND author_id = ?';
        params.push(author_id);
    }

    if (category_id != null) {
        query += ' AND category_id = ?';
        params.push(category_id);
    }

    if (pattern != null) {
        query += ' AND title REGEXP ?';
        params.push(pattern);
    }

    if (sortBy === "ALPHABETICAL_ASC") {
        query += ' ORDER BY title'
    } else if (sortBy === "ALPHABETICAL_DESC") {
        query += ' ORDER BY title DESC'
    } else if (sortBy === "SIGNATURES_ASC") {
        query += ' ORDER BY signature_count, title';
    } else if (sortBy === "SIGNATURES_DESC" || sortBy === undefined) {
        query += ' ORDER BY signature_count DESC, title';
    }

    const [rows] = await conn.query(query, params);
    conn.release();
    return rows;
};

exports.getOne = async function(petition_id){
    console.log(`Attempting to retrieve petition with id ${petition_id} from database`);

    const conn = await db.getPool().getConnection();
    let query = 'SELECT * FROM Petition WHERE petition_id = ?';

    const [rows] = await conn.query(query, [petition_id]);
    conn.release();
    return rows;
};

exports.getCategories = async function() {
    return null
};

exports.insert = async function(authorID, title, description, categoryID) {
    console.log("Attempting to insert petition into database");

    const conn = await db.getPool().getConnection();
    const query = 'INSERT INTO petition (authorID, title, description, categoryID) VALUES (?, ?, ?, ?)';
    await conn.query(query, [authorID, title, description, categoryID]);
    conn.release();
};

exports.alter = async function(){
    return null;
};

exports.remove = async function(){
    return null;
};
