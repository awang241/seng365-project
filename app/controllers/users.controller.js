const model = require('../models/users.model');
const auth = require('../middleware/passwords.middleware');
const responses = require('./responses');
const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)])/;

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
        if (result.length === 0) {
            return res.status(400).send('Invalid email or password');
        } else if (result[0].auth_token !== null) {
            return res.status(400).send('Already logged in');
        } else if (!auth.checkPassword(password, result[0].password)) {
            return res.status(400).send('Invalid email or password');
        } else {
            const id = result[0].user_id;
            const token = auth.generateToken();
            await model.setToken(id, token);
            return res.status(200).json({userId: id, token: token});
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
        const result = await model.findByEmail(req.body.email);
        if (result.length > 0) {
            return res.status(400).send("Email already in use");
        }
        if (city === undefined) {city = null}
        if (country === undefined) {country = null}
        await model.insert(req.body.name, req.body.email, auth.hash(req.body.password), city, country);
        return res.status(201).end();
    } catch (err) {
        console.log(err);
        return res.status(500).send("Internal server error")
    }
};

exports.read = async function(req, res) {
    try {
        let id = req.params.id;
        let token = req.get('X-Authorization');
        const authenticated = await model.authenticateToken(token, id);
        const result = await model.findById(id);
        if (result.length === 0) {
            return res.status(404).send("No user with that ID exists");
        } else {
            let email = undefined;
            if (authenticated) {
                email = result[0].email;
            }
            const body = new responses.User(result[0].name, result[0].city, result[0].country, email);
            return res.status(200).json(body);
        }
    } catch (e) {
        console.log(e);
        return res.status(500).send('Internal server error')
    }
};

exports.update = async function(req, res) {
    try {
        let id = req.params.id;
        let token = req.get('X-Authorization');
        const authenticated = await model.authenticateToken(token, id);
        if (!authenticated) {
            return res.status(401).send("Could not authenticate token")
        }

        if (req.body.email !== undefined) {
            const emailCheck = await model.findByEmail(req.body.email );
            if (emailCheck.length > 0) {
                return res.status(400).send("Email already in use");
            }
        }

        const result = await model.findById(id);
        if (req.body.password !== undefined && result[0].password !== req.body.currentPassword) {
            return res.status(403).send("Correct current password is needed for password change")
        }

        if (!isUpdateDistinct(req.body, result[0])) {
            return res.status(400).send("Update must edit at least one field")
        }

        await model.alter(id, req.body.name,req.body.email,req.body.password,req.body.city, req.body.country);
        return res.status(200).end();
    } catch (e) {
        console.log(e);
        return res.status(500).send('Internal server error')
    }
};

let isUpdateDistinct = function(update, original) {
    return !((update.name === undefined || update.name === original.name)
        && (update.email === undefined || update.email === original.email)
        && (update.password === undefined || update.password === original.password)
        && (update.city === undefined || update.city === original.city)
        && (update.country === undefined || update.country === original.country));
};

