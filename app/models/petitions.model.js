const db = require('../../config/db');

function toSQLDatetime(date) {
    return date.toISOString().slice(0, 19).replace('T', ' ');
}

exports.categoryExistsByID = async function(categoryID) {
    const conn = await db.getPool().getConnection();
    const query = "SELECT * FROM Category WHERE category_id = ?";

    let [result] = await conn.query(query, [categoryID]);
    conn.release();
    return (result.length) > 0
};

exports.existsByID = async function(petitionID) {
    const conn = await db.getPool().getConnection();
    const query = "SELECT * FROM Petition WHERE petition_id = ?";

    let [result] = await conn.query(query, [petitionID]);
    conn.release();
    return (result.length) > 0
};

exports.isOpen = async function(petitionID) {
    const result = await exports.getOne(petitionID);
    if (result.length === 0) {
        return false
    } else {
        const closingDate = result[0].closing_date;
        if (closingDate === null) {
            return true
        } else {
            return Date.parse(closingDate) > Date.now()
        }
    }
};

exports.getAll = async function(author_id, category_id, pattern, sortBy){
    console.log("Attempting to retrieve petitions from database");

    const conn = await db.getPool().getConnection();
    let query = 'SELECT P.petition_id, title, author_id, U.name a_name, C.category_id, C.name c_name, s_count FROM Petition P LEFT JOIN ' +
    '(SELECT petition_id, COUNT(*) s_count FROM Signature GROUP BY petition_id) S ON P.petition_id = S.petition_id ' +
    'JOIN User U ON P.author_id = U.user_id JOIN Category C ON P.category_id = C.category_id WHERE 1 = 1';
    /*
    const selectFieldsFrag = ' SELECT Petition.petition_id, title, author_id, AuthorNames.name AS author_name, ' +
        'C.category_id, C.name AS category_name, signature_count FROM Petition ';
    const joinSignaturesFrag = ' JOIN (SELECT petition_id, COUNT(*) AS signature_count FROM Signature GROUP BY petition_id) ' +
        'AS SigCounts ON Petition.petition_id = SigCounts.petition_id ';
    const joinAuthorsFrag =  ' JOIN (SELECT user_id, name FROM User) AS AuthorNames ON Petition.author_id = AuthorNames.user_id ';
    const joinCategoriesFrag =  ' JOIN Category C ON Petition.category_id = C.category_id WHERE 1 = 1 ';
    let query = selectFieldsFrag + joinSignaturesFrag + joinAuthorsFrag + joinCategoriesFrag;
    */

    const params = [];

    if (author_id != null) {
        query += ' AND author_id = ?';
        params.push(author_id);
    }

    if (category_id != null) {
        query += ' AND C.category_id = ?';
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
        query += ' ORDER BY s_count, title';
    } else if (sortBy === "SIGNATURES_DESC" || sortBy === undefined) {
        query += ' ORDER BY s_count DESC, title';
    }

    const [rows] = await conn.query(query, params);
    conn.release();
    console.log(rows);
    return rows;
};

exports.getOne = async function(petition_id){
    console.log(`Attempting to retrieve petition with id ${petition_id} from database`);

    const conn = await db.getPool().getConnection();
    const selectFieldsFrag = ' SELECT Petition.petition_id, title, C.name AS category, signature_count, description, ' +
        ' U.name AS author_name, author_id, city, country, created_date, closing_date FROM Petition ';
    const joinSignaturesFrag = ' LEFT JOIN (SELECT petition_id, COUNT(*) AS signature_count FROM Signature GROUP BY petition_id) ' +
        'AS SigCounts ON Petition.petition_id = SigCounts.petition_id ';
    const joinAuthorsFrag =  ' JOIN User U ON author_id = user_id ';
    const joinCategoriesFrag =  ' JOIN Category C ON Petition.category_id = C.category_id WHERE Petition.petition_id = ?';
    let query = selectFieldsFrag + joinSignaturesFrag + joinAuthorsFrag + joinCategoriesFrag;
    const [rows] = await conn.query(query, [petition_id]);
    conn.release();
    return rows;
};

exports.getCategories = async function() {
    console.log('Attempting to retrieve list of categories from database');

    const conn = await db.getPool().getConnection();
    let query = 'SELECT * FROM Category';

    const [rows] = await conn.query(query);
    conn.release();
    return rows;
};

exports.insert = async function(authorID, title, description, categoryID, dateString=undefined) {
    console.log("Attempting to insert petition into database");

    const conn = await db.getPool().getConnection();
    const now = toSQLDatetime(new Date(Date.now()));
    const params = [authorID, title, description, categoryID, now];
    let query;
    if (dateString === undefined) {
        query = 'INSERT INTO Petition (author_id, title, description, category_id, created_date) VALUES (?, ?, ?, ?, ?)';
    } else {
        query = 'INSERT INTO Petition (author_id, title, description, category_id, created_date, closing_date) VALUES (?, ?, ?, ?, ?, ?)';
        const closingDate = toSQLDatetime(new Date(dateString));
        params.push(closingDate);
    }
    await conn.query(query, params);
    const result = await conn.query('SELECT LAST_INSERT_ID()');
    conn.release();
    return result[0][0]['LAST_INSERT_ID()'];
};

exports.alter = async function(id, title, description, categoryID, closingDateString){
    const conn = await db.getPool().getConnection();
    let query = "UPDATE Petition SET title = title";
    let params = [];
    if (title !== undefined) {
        query += ', title = ? ';
        params.push(title);
    }
    if (description !== undefined) {
        query += ', description = ? ';
        params.push(description);
    }
    if (categoryID !== undefined) {
        query += ', category_id = ? ';
        params.push(categoryID);
    }
    if (closingDateString !== undefined) {
        query += ', closing_date = ? ';
        params.push(toSQLDatetime(closingDateString));
    }
    query = query + "WHERE petition_id = ?";
    params.push(id);
    await conn.query(query, params);
    conn.release();
};

exports.remove = async function(petitionID){
    const conn = await  db.getPool().getConnection();
    const signatureQuery = 'DELETE FROM Signature WHERE petition_id = ?',
        petitionQuery = 'DELETE FROM Petition WHERE petition_id = ?';
    await conn.query(signatureQuery, [petitionID]);
    await conn.query(petitionQuery, [petitionID]);
    conn.release();
};
