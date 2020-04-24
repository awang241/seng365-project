const photos = require('../controllers/users.photos.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/users/:id/photo')
        .put(photos.set)
        .get(photos.get)
        .delete(photos.delete);
};