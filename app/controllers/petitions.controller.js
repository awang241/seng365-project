const petition = require('../models/petitions.model');
const users = require('../models/users.model');
const responses = require('./responses');

function parseIntIfDefined(string, defaultValue=undefined) {
    if (string === undefined) {
        return defaultValue;
    } else {
        return parseInt(string);
    }
}

function filterRawPetitions(rawPetitions) {
    const petitionOverviews = [];
    for (let i = 0; i < rawPetitions.length; i++) {
        let rawPetition = rawPetitions[i];
        if (rawPetition.s_count === null) {rawPetition.s_count = 0;}
        let petitionOverview = new PetitionOverview(rawPetition.petition_id, rawPetition.title, rawPetition.c_name,
            rawPetition.a_name, rawPetition.s_count);
        petitionOverviews.push(petitionOverview);
    }
    return petitionOverviews;
}

function PetitionOverview(id, title, category, author, signatureCount) {
    this.petitionId = id;
    this.title = title;
    this.category = category;
    this.authorName = author;
    this.signatureCount = signatureCount;
}

exports.list = async function(req, res){
    const searchRequest = {
        startIndex: parseIntIfDefined(req.query.startIndex, 0),
        count: parseIntIfDefined(req.query.count),
        q: req.query.q,
        categoryID: parseIntIfDefined(req.query.categoryId),
        authorID: parseIntIfDefined(req.query.authorId),
        sortBy: req.query.sortBy,
        reverseSort: false
    };
    if (Number.isNaN(searchRequest.startIndex)) {
       return res.status(400).send(`Illegal argument ${searchRequest.startIndex} for startIndex`);
    } else if (Number.isNaN(searchRequest.count)) {
        return res.status(400).send(`Illegal argument ${searchRequest.count} for count`);
    } else if (Number.isNaN(searchRequest.categoryID)) {
        return res.status(400).send(`Illegal argument ${searchRequest.authorID} for categoryID`);
    } else if (Number.isNaN(searchRequest.authorID)) {
        return res.status(400).send(`Illegal argument ${searchRequest.authorID} for authorID`);
    }

    const sortByEnum = ['ALPHABETICAL_ASC', 'ALPHABETICAL_DESC', 'SIGNATURES_ASC', 'SIGNATURES_DESC'];
    if (searchRequest.sortBy === undefined) {
        searchRequest.sortBy = 'SIGNATURES_DESC';
    } else if (!sortByEnum.includes(searchRequest.sortBy)) {
        return res.status(400).send("Illegal query argument for sortBy");
    }

    try {
        const result = await petition.getAll(searchRequest.authorID, searchRequest.categoryID,
                                            searchRequest.q, searchRequest.sortBy);
        let responseBody;
        if (searchRequest.count === undefined) {
            responseBody = filterRawPetitions(result.slice(searchRequest.startIndex));
        } else {
            console.log(searchRequest.startIndex);
            responseBody = filterRawPetitions(result.slice(searchRequest.startIndex, searchRequest.startIndex + searchRequest.count));
        }
        return res.status(200).send(responseBody);
    } catch (err) {
        console.log(err);
        return res.status(500).send(`Internal Server Error: ${err}`);
    }
};

exports.listCategories = async function(req, res){
    try {
        let result = await petition.getCategories();
        return res.status(200).send(result);
    } catch (err) {
        return res.status(500).send('Internal Server Error')
    }
};

exports.create = async function(req, res){
    try {
        if (typeof req.body.title !== "string" || req.body.title.length === 0) {
            return res.status(400).send('Title must be a string of non-zero length');
        } else if (typeof req.body.description !== "string") {
            return res.status(400).send('Description must be a string');
        } else if (!await petition.categoryExistsByID(req.body.categoryId)) {
            return res.status(400).send('Category ID is invalid');
        } else if (req.body.closingDate !== undefined) {
            const date = new Date(req.body.closingDate);
            if (date.toString() === "Invalid Date") {
                return res.status(400).send('Date string formatted incorrectly');
            } else if (date.getTime() <= Date.now()) {
                return res.status(400).send('Closing date must be in the future')
            }
        }

        const result = await users.findByToken(req.get('X-Authorization'));
        if (result.length === 0) {
            return res.status(401).send("Could not authenticate token");
        }
        const authorID = result[0].user_id;
        const petitionID = await petition.insert(authorID, req.body.title, req.body.description, req.body.categoryId, req.body.closingDate);
        return res.status(201).send({petitionId: petitionID});
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }

};

exports.read = async function(req, res){
    try {
        const id = req.params.id;
        if (!Number.isInteger(parseInt(id))) {
            return res.status(400).send("Petition ID must be an integer")
        } else {
            let result = await petition.getOne(id);
            if (result.length === 1) {
                return res.status(200).send(new responses.Petition(result[0]));
            } else {
                return res.status(404).send("No petition with that ID in the database");
            }
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal Server Error")
    }
};

exports.update = async function(req, res){
    try {
        if ((typeof req.body.title !== "string" || req.body.title.length === 0) && req.body.title !== undefined) {
            return res.status(400).send('Title must be a string of non-zero length');
        } else if (typeof req.body.description !== "string" && req.body.description !== undefined) {
            return res.status(400).send('Description must be a string');
        } else if (!await petition.categoryExistsByID(req.body.categoryId) && req.body.categoryId !== undefined) {
            return res.status(400).send('Category ID is invalid');
        } else if (req.body.closingDate !== undefined) {
            const date = new Date(req.body.closingDate);
            if (date.toString() === "Invalid Date") {
                return res.status(400).send('Date string formatted incorrectly');
            } else if (date.getTime() <= Date.now()) {
                return res.status(400).send('Closing date must be in the future');
            }
        }
        const petitionID = req.params.id,
            token = req.get('X-Authorization');
        const petitions = await petition.getOne(petitionID);
        if (petitions.length === 0) {
            return res.status(404).send("No petition with that ID in the database");
        }
        const authorID = petitions[0].author_id;
        const userRes = await users.findByToken(token);
        if (userRes.length === 0){
            return res.status(401).send("Could not authenticate token");
        } else if (userRes[0].user_id !== authorID){
            return res.status(403).send("Only the author of the petition may update it");
        }

        if (Date.now() > Date.parse(petitions[0].closing_date)) {
            return res.status(403).send("Closed petitions cannot be updated");
        }

        await petition.alter(petitionID, req.body.title, req.body.description, req.body.categoryId, req.body.closingDate);
        return res.status(200).send('Petition updated successfully')
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal server error')
    }
};

exports.delete = async function(req, res){
    try {
        const id = req.params.id;
        const token = req.get('X-Authorization');
        const result = await petition.getOne(id);
        if (result.length === 0) {
            return res.status(404).send("No petition with that ID in the database");
        }
        const userRes = await users.findByToken(token);
        if (userRes.length === 0) {
            return res.status(401).send("Could not authenticate token");
        } else if (userRes[0].user_id !== result[0].author_id) {
            return res.status(403).send("Only the author of a petition may delete it");
        }
        petition.remove(id);
        return res.status(200).send("Petition deleted");
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal server error')
    }
};

let isUpdateDistinct = function(update, original) {
    return !((update.title === undefined || update.title === original.title)
        && (update.description === undefined || update.description === original.description)
        && (update.categoryID === undefined || update.categoryID === original.category_id)
        && (update.closingDate === undefined || update.closingDate === original.closing_date))
};
