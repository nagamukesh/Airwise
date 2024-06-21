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

router.get('/',(req,res)=>{
    console.log(req.body);
    res.render('search',{result:req.body})
})

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.MY_SQL_HOST,
    user            : process.env.MY_SQL_USER,
    password        : process.env.MY_SQL_PASSWORD,
    database        : process.env.MY_SQL_DATABASE
  });

router.post('/', encoder, async (req, res) => {
    const departure_date = req.body.departure_date;
    const Departure_City = req.body.Departure_City;
    const Destination_City = req.body.Destination_City;
    const username=req.body.user_name;
    console.log(username);
    
    
        pool.query('SELECT * FROM flight F JOIN airport Dep ON F.departure = Dep.airport_code JOIN airport Ar ON F.destination = Ar.airport_code WHERE F.departure_date = ? AND Dep.location = ? AND Ar.location = ?',
        [departure_date, Departure_City, Destination_City],
        (error, result, fields) => {
            if (error) {
                console.error('Error fetching data:', error);
                res.status(500).json({ error: 'Error fetching data' });
            } else if (result.length === 0) {
                res.status(404).send("Flight not found");
            } else {
                result[0].username = username;
                res.render('searchResult', { flights: result });
            }
        });
    
    
})

router.post('/selectedFlight',(req,res)=>{
    const selectedFlightID = req.body.selectedFlight;

    pool.query('SELECT * FROM flight WHERE flightID = ?', [selectedFlightID], (error, result, fields) => {
        if (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Error fetching data' });
        } else if (result.length === 0) {
            res.status(404).send("Selected flight not found");
        } else {
            const flight = result[0];
            res.render('selectedFlight', { flight: flight });
        }
    });
})

module.exports=router