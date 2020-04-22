const petition = require('../models/petitions.model');

function sortPetitionsByTitle(a, b) {
    var titleA = a.title.toLowerCase();
    var titleB = b.title.toLowerCase();
    if (titleA < titleB) {
        return -1;
    } else if (titleA > titleB) {
        return 1;
    } else {
        return 0;
    }
}

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
    var searchRequest = {
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
    return null;
};

exports.create = async function(req, res){
    return null;
};

exports.read = async function(req, res){
    return null;
};

exports.update = async function(req, res){
    return null;
};

exports.delete = async function(req, res){
    return null;
};
