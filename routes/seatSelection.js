const express = require('express');
const router = express.Router();
const mysql = require("mysql");
const path = require("path");
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const bodyParser = require("body-parser");
const encoder = bodyParser.urlencoded();
app.use(express.urlencoded({ extended: false }));

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.MY_SQL_HOST,
  user: process.env.MY_SQL_USER,
  password: process.env.MY_SQL_PASSWORD,
  database: process.env.MY_SQL_DATABASE
});

// Set up views directory
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

router.post('/', (req, res) => {
  const selectedFlightID = req.body.flightID;

  // Fetch seat information for the selected flight from the database
  pool.query('SELECT * FROM seats WHERE flightID = ?', [selectedFlightID], (error, results) => {
    if (error) {
      console.error('Error fetching data:', error);
      res.status(500).json({ error: 'Error fetching data' });
    } else {
      const seats = results.map(row => ({
        seat_id: row.seat_id,
        seat_number: row.seat_number,
        seat_class: row.seat_class,
        availability: row.availability
      }));

      // Fetch pricing information for each class
      pool.query('SELECT * FROM Pricing WHERE flightID = ?', [selectedFlightID], (error, results) => {
        if (error) {
          console.error('Error fetching pricing data:', error);
          res.status(500).json({ error: 'Error fetching pricing data' });
        } else {
          // Map pricing data to an object
          const pricing = results.reduce((acc, curr) => {
            acc[curr.seat_class] = curr.price;
            return acc;
          }, {});

          // Render the seat selection page with seat and pricing information
          res.render('seatSelection', { seatInfo: { flightID: selectedFlightID, seats: seats }, pricing: pricing });
        }
      });
    }
  });
});

module.exports = router;