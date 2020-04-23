const petition = require('../models/petitions.model');

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
        let petitionOverview = new PetitionOverview(rawPetition.petition_id, rawPetition.title, rawPetition.author_name,
                                                    rawPetition.category_name, rawPetition.signature_count);
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
        } else if (!(Number.isInteger(req.body.categoryId)) || req.body.categoryId < 0) {
            return res.status(400).send('Category ID must be a positive integer');
        } else if (req.body.closingDate !== undefined && new Date(req.body.closingDate).toString() === "Invalid Date") {
            return res.status(400).send('Date string formatted incorrectly');
        }
        return res.status(201).send('TODO');
    } catch (err) {
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
                return res.status(200).send(result[0]);
            } else {
                return res.status(404).send("No petition with that ID in the database");
            }
        }
    } catch (err) {
        console.log(err)
        return res.status(500).send("Internal Server Error")
    }
};

exports.update = async function(req, res){
    return null;
};

exports.delete = async function(req, res){
    return null;
};
