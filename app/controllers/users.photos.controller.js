const model = require('../models/users.photos.model');
const users = require('../models/users.model');
const mime = require('mime');
const fs = require('fs');
const path = require('path');
const photoDirectory = path.dirname(require.main.filename) + "/storage/photos/";

exports.get = async function(req, res) {
    try {
        const result = await users.findById(req.params.id);
        if (result.length === 0) {
            return res.status(404).send("No user with that ID exists");
        }
        const filepath = photoDirectory + result[0].photo_filename;
        if (fs.existsSync(filepath)) {
            const image = fs.readFileSync(filepath);
            const type = mime.getType(filepath);
            console.log(type);
            return res.status(200).contentType(type).send(image)
        } else {
            return res.status(404).send('Image not found')
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send('Internal server error')
    }
};

exports.set = async function(req, res) {
    try {
        const id = req.params.id;
        const token = req.get('X-Authorization');
        const type = req.get('Content-Type'),
            typeEnum = ['image/png', 'image/jpeg', 'image/gif'];

        if (!typeEnum.includes(type)) {
            return res.status(400).send("Invalid file type");
        }

        const usersRes = await users.findByToken(token);
        if (usersRes === 0) {
            return res.status(401).send("Could not authenticate token")
        } else if (usersRes[0].user_id !== id) {
            return res.status(403).send("Profiles can only be edited by their owner")
        }

        const result = await users.findById(id);
        if (result.length === 0) {
            return res.status(404).send("No user with that ID exists");
        }
        let statusCode;
        if (result[0].photo_filename === null) {
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
        const filename = `user_${id}-${dateString}.` + extension;

        await model.alter(id, filename);
        fs.writeFileSync(photoDirectory + filename, req.body);
        return res.status(statusCode).send("Photo added successfully")
    } catch (e) {
        console.log(e);
        return res.status(500).send('Internal server error')
    }
};

exports.delete = async function(req, res) {
    try {
        const id = req.params.id;
        const token = req.get('X-Authorization');
        const result = await users.findById(id);
        if (result.length === 0) {
            return res.status(404).send("No user with that ID exists");
        }
        const authenticated = await users.authenticateToken(token, id);
        if (!authenticated) {
            return res.status(401).send("Could not authenticate token")
        }

        if (result[0].photo_filename === null) {
            return res.status(403).send("User does not have a photo");
        } else {
            const filepath = photoDirectory + result[0].photo_filename;
            if (fs.existsSync(filepath)){
                fs.unlinkSync(filepath);
            }
            await model.clear(id);
            return res.status(200).send("Photo deleted successfully")
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send('Internal server error')
    }
};