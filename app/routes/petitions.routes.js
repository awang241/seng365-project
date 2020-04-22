const petitions = require('../controllers/petitions.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions')
        .post(petitions.create)
        .get(petitions.list);

    app.route(app.rootUrl + '/petitions/:id')
        .get(petitions.read)
        .patch(petitions.update)
        .delete(petitions.delete);

    app.route(app.rootUrl + '/petitions/categories')
        .get(petitions.listCategories);
};
