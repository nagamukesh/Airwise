const express = require('express');
const https = require("https");
const mysql = require("mysql");
const path = require("path");
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

dotenv.config();
const router = express.Router();
const app = express();
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded();
app.use(express.urlencoded({ extended: false }));

router.get('/', (req, res) => {
    res.render('users');
});

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MY_SQL_HOST,
    user: process.env.MY_SQL_USER,
    password: process.env.MY_SQL_PASSWORD,
    database: process.env.MY_SQL_DATABASE
});

// Promisified query function for MySQL
const query = (sql, values) => {
    return new Promise((resolve, reject) => {
        pool.query(sql, values, (error, results) => {
            if (error) {
                reject(error);
            } else {
                resolve(results);
            }
        });
    });
};

router.post('/', encoder, async (req, res) => {
    const username = req.body.name;
    const password = req.body.password;
    const role = 0;
    console.log("username:", username);
    console.log(password);

    try {
        const result = await query('SELECT * FROM user WHERE user_name = ?', [username]);
        if (result.length > 0) {
            if (result[0].password === password) {
                const token = jwt.sign({ username: username }, process.env.JWT_SECRET);
                console.log(result[0]);

                await query('DELETE FROM active');
                await query('INSERT INTO active VALUES(?)', [username]);

                // Render the page only after all queries are performed
                res.render('home', { result: result[0] });
            } else {
                res.send('Login failed! incorrect password');
            }
        } else {
            res.send("user not found!");
        }
    } catch (error) {
        console.log(error);
    }
});

router.get('/new', (req, res) => {
    res.render('users/new');
});

router.post('/new', encoder, async (req, res) => {
    console.log(req.body.email);
    const email = req.body.email;
    const username = req.body.name;
    const password = req.body.password;
    console.log("username:", username);
    console.log(password);

    try {
        const result = await query('SELECT email, user_name FROM user WHERE email = ? OR user_name = ?', [email, username]);
        if (result.length !== 0) {
            res.send("user already exists!");
        } else {
            await query('INSERT INTO user (user_name, password, email) VALUES (?, ?, ?)', [username, password, email]);
            await query('DELETE FROM active');
            await query('INSERT INTO active VALUES(?)', [username]);
            const newUserResult = await query("SELECT * FROM user WHERE user_name=?", [username]);

            // Render the page only after all queries are performed
            console.log(newUserResult[0]);
            res.render('home', { result: newUserResult[0] });
        }
    } catch (error) {
        console.log(error);
    }
});

module.exports = router;