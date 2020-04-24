const petitions = require('../controllers/petitions.signatures.controller');

module.exports = function (app) {
    app.route(app.rootUrl + '/petitions/:id/signatures')
        .get(petitions.getSignatures)
        .post(petitions.sign)
        .delete(petitions.unsign);
};
