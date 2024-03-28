const express=require('express')
const router=express.Router()
const https=require("https");
const mysql=require("mysql");
const path=require("path");
const dotenv= require('dotenv');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

dotenv.config()
const app=express()
const bodyParser=require("body-parser");
const encoder=bodyParser.urlencoded();
app.use(express.urlencoded({extended:false}))

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.MY_SQL_HOST,
    user            : process.env.MY_SQL_USER,
    password        : process.env.MY_SQL_PASSWORD,
    database        : process.env.MY_SQL_DATABASE
  });

router.post('/', (req, res) => {
    const selectedFlightID = req.body.flightID; // Assuming this is the ID of the selected flight

    // Fetch seat information for the selected flight from the database
    // You can add your logic here to fetch seat availability and other seat-related information

    const seatInfo = {
        flightID: selectedFlightID,
        // Add other seat information here
    };

    console.log(req.body);

    pool.query('SELECT * FROM flight WHERE flightID = ?', [selectedFlightID], (error, result, fields) => {
        if (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Error fetching data' });
        } else if (result.length === 0) {
            console.log(selectedFlightID);
            res.status(404).send("Selected flight not found");
        } else {
            pool.query('SELECT seat_class, count(*) as num_seats FROM seats WHERE flightID=? AND availability=? GROUP BY seat_class', [selectedFlightID, 1], (error, results) => {
                if (error) {
                    console.error('Error fetching data:', error);
                    res.status(500).json({ error: 'Error fetching data' });
                } else {
                    const seats = results.map(row => ({
                        seat_class: row.seat_class,
                        num_seats: row.num_seats
                    }));
                    res.render('seatSelection', { seatInfo: { flightID: selectedFlightID, seats: seats } });
                }
            });
        }
        
    });
});

module.exports = router;

