const model = require('../models/petitions.photos.model');
const petitions = require('../models/petitions.model');
const users = require('../models/users.model');
const mime = require('mime');
const fs = require('fs');
const path = require('path');
const photoDirectory = path.dirname(require.main.filename) + "/storage/photos/";

exports.retrieve = async function(req, res) {
    try {
        const result = await model.get(req.params.id);
        if (result.length === 0) {
            return res.status(404).send("No petition with that ID exists");
        }
        const filepath = photoDirectory + result[0].photo_filename;
        if (fs.existsSync(filepath)) {
            const image = fs.readFileSync(filepath);
            const type = mime.getType(filepath);
            return res.status(200).contentType(type).send(image)
        } else {
            return res.status(404).send('Image not found')
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error')
    }
};

exports.update = async function(req, res) {
    const petitionID = req.params.id;
    const token = req.get('X-Authorization');
    const type = req.get('Content-Type'),
        typeEnum = ['image/png', 'image/jpeg', 'image/gif'];

    if (!typeEnum.includes(type)) {
        return res.status(400).send("Invalid file type");
    }

    const result = await users.findByToken(token);
    if (result.length === 0) {
        return res.status(401).send("Could not authenticate token")
    }
    const userID = result[0].user_id;

    const petitionRes = await petitions.getOne(petitionID);
    if (petitionRes.length === 0) {
        return res.status(404).send("No petition with that ID exists")
    }
    const petition = petitionRes[0];

    if (petition.author_id !== userID){
        return res.status(403).send("Petitions can only be edited by their authors");
    }

    let statusCode;
    if (petition.photo_filename === null) {
        statusCode = 201;
    } else {
        statusCode = 200;
        let oldFilepath = photoDirectory + result[0].photo_filename;
        if (fs.existsSync(oldFilepath)) {
            fs.unlinkSync(oldFilepath);
        }
    }
    const extension = mime.getExtension(type);
    const date = new Date(Date.now());
    const dateString = date.toISOString().replace(':', '-').replace('.', '-');
    const filename = `petition_${petitionID}-${dateString}.` + extension;

    await model.set(filename, petitionID);
    fs.writeFileSync(photoDirectory + filename, req.body);
    return res.status(statusCode).send("Photo set successfully")

};