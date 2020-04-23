const model = require('../models/petitions.signatures.model');

exports.getSignatures = async function(req, res) {
    try {
        const id = req.params.id;
        const result = await model.read(id);
        if (result.length === 0) {
            return res.status(404).send('Either that petition has no signatures or doesn\'t exist in the database');
        } else {
            return res.status(200).send(result);
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