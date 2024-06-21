const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const dotenv = require('dotenv');

dotenv.config();

const pool = mysql.createPool({
    connectionLimit: 10,
    host: process.env.MY_SQL_HOST,
    user: process.env.MY_SQL_USER,
    password: process.env.MY_SQL_PASSWORD,
    database: process.env.MY_SQL_DATABASE
});

router.get('/',(req,res)=>{
    res.render('initial');
})

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

router.post('/profile', async (req, res) => {
    const username = req.body.user_name;
    console.log(username)
    try {
        const activeUsers = await query('SELECT * FROM active');
        if (activeUsers.length === 0) {
            res.status(404).send("User not found");
            return;
        }
        const result = await query('SELECT DISTINCT U.*,B.*,F.* FROM user U LEFT JOIN booking B ON B.user_name = U.user_name LEFT JOIN ticket T ON B.booking_id = T.booking_id LEFT JOIN flight F ON T.flight_no = F.flightID WHERE U.user_name = ?', [username]);
        res.render('profile', { result });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    }
});

module.exports = router;