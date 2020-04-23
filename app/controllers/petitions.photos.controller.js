const model = require('../models/petitions.photos.model');
const path = require('path');
const resourcePath = path.dirname(require.main.filename) + "/storage/photos/";

exports.retrieve = async function(req, res) {
    try {
        const id = req.params.id;
        const result = await model.getPhotoFilename(id);
        if (result.length === 0) {
            return res.status(404).send("No petition with that ID exists");
        } else {
            const filename = result[0].photo_filename;
            console.log(resourcePath + filename);
            return res.status(200).sendFile(resourcePath + filename);
        }

    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error')
    }
};

exports.update = async function(req, res) {

};