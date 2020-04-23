const model = require('../models/petitions.signatures.model');
const responses = require('./responses');

exports.getSignatures = async function(req, res) {
    try {
        const id = req.params.id;
        const result = await model.read(id);
        if (result.length === 0) {
            return res.status(404).send('Either that petition has no signatures or doesn\'t exist in the database');
        } else {
            let signatures = [];
            for (let i = 0; i < result.length; i++) {
                let rawSign = result[i];
                signatures.push(new responses.Signature(rawSign.signatory_id, rawSign.name, rawSign.city,
                                                        rawSign.country, rawSign.signed_date));
            }
            return res.status(200).send(signatures);
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

exports.sign = async function(req, res) {

};

exports.unsign = async function(req, res) {

};