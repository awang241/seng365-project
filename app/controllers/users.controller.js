const model = require('../models/users.model');
const auth = require('../middleware/passwords.middleware');
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/;


exports.checkToken = async function (token, user_id) {

};

exports.login = async function(req, res) {
    try {
        let email = req.body.email;
        let password = req.body.password;
        if (email === undefined) {
            return res.status(400).send('Email field is missing');
        } else if (password === undefined) {
            return res.status(400).send('Password field is missing');
        }
        const result = await model.findByEmail(email);
        const actualPassword = result[0].password;
        if (result.length === 0 || password !== actualPassword) {
            return res.status(400).send('Invalid email or password');
        } else if (result[0].auth_token !== null) {
            return res.status(400).send('Already logged in');
        } else {
            const id = result[0].user_id;
            const token = auth.generateToken();
            await model.setToken(id, token);
            return res.status(200).json({userID: id, token: token});
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send('Internal Server Error');
    }
};

exports.logout = async function(req, res) {
    try {
        const result = await model.findByToken(req.get('X-Authorization'));
        if (result.length === 0) {
            return res.status(401).send("Could not authenticate token")
        } else {
            await model.clearToken(result[0].user_id);
            return res.status(200).send();
        }
    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal server error")
    }
};

exports.create = async function(req, res) {
    try {
        let city = req.body.city;
        let country = req.body.country;
        if (req.body.name === undefined || req.body.name.length < 1) {
           return res.status(400).send("Name field is missing");
        } else if (req.body.email === undefined || !req.body.email.match(emailRegex)) {
            return res.status(400).send("Email field is missing or invalid");
        } else if (req.body.password === undefined || req.body.password.length < 1) {
            return res.status(400).send("Password field is missing");
        }
        if (city !== undefined) {city = null}
        if (country !== undefined) {country = null}
        await model.insert(req.body.name, req.body.email, req.body.password, city, country);
        return res.status(201).end();
    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal server error")
    }
};

exports.read = async function(req, res) {

};

exports.update = async function(req, res) {

};