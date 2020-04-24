const model = require('../models/petitions.signatures.model');
const petitions = require('../models/petitions.model');
const users = require('../models/users.model');
const responses = require('./responses');

exports.getSignatures = async function(req, res) {
    try {
        const id = req.params.id;
        if (!await petitions.existsByID(id)) {
            return res.status(404).send('Petition doesn\'t exist in the database');
        }
        const result = await model.read(id);
        let signatures = [];
        for (let i = 0; i < result.length; i++) {
            let rawSign = result[i];
            signatures.push(new responses.Signature(rawSign.signatory_id, rawSign.name, rawSign.city,
                                                    rawSign.country, rawSign.signed_date));
        }
        return res.status(200).send(signatures);

    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

exports.sign = async function(req, res) {
    try {
        const petitionID = req.params.id;
        let userID;
        if (!await petitions.existsByID(petitionID)) {
            return res.status(404).send('Petition doesn\'t exist in the database');
        }
        const result = await users.findByToken(req.get('X-Authorization'));
        if (result.length === 0) {
            return res.status(401).send('Could not authenticate token');
        } else {
            userID = result[0].user_id;
        }

        if (!await petitions.isOpen(petitionID)) {
            return res.status(403).send('Cannot sign closed petitions');
        } else if (await model.haveSigned(petitionID, userID)) {
            return res.status(403).send('Petition has already been signed');
        } else {
            await model.insert(petitionID, userID);
            return res.status(201).send('Petition signed successfully');
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

exports.unsign = async function(req, res) {
    try {
        const petitionID = req.params.id;
        let userID;
        if (!await petitions.existsByID(petitionID)) {
            return res.status(404).send('Petition doesn\'t exist in the database');
        }
        const result = await users.findByToken(req.get('X-Authorization'));
        if (result.length === 0) {
            return res.status(401).send('Could not authenticate token');
        } else {
            userID = result[0].user_id;
        }

        if (!await petitions.isOpen(petitionID)) {
            return res.status(403).send('Cannot unsign closed petitions');
        } else if (!await model.haveSigned(petitionID, userID)) {
            return res.status(403).send('Petition has not been signed yet');
        } else {
            await model.remove(petitionID, userID);
            return res.status(200).send('Petition unsigned successfully');
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};