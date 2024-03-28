const express=require('express')
const https=require("https");
const mysql=require("mysql");
const path=require("path");
const dotenv= require('dotenv');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');

dotenv.config()
const router=express.Router()
const app=express()
const bodyParser=require("body-parser");
const encoder=bodyParser.urlencoded();
app.use(express.urlencoded({extended:false}))

router.get('/',(req,res)=>{
    res.render('admin/new')
})

router.get('/users',(req,res)=>{
    pool.query('SELECT * FROM user', (error, results) => {
        if (error) {
            console.error('Error fetching flights:', error);
            res.status(500).send('Error fetching flights');
        } else {
            // Render admin page and pass available flights data
            res.render('admin/users', { users: results });
        }
    });
})

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.MY_SQL_HOST,
    user            : process.env.MY_SQL_USER,
    password        : process.env.MY_SQL_PASSWORD,
    database        : process.env.MY_SQL_DATABASE
  });

router.post('/',encoder,async(req,res)=>{
    const username=req.body.username 
    const password=req.body.password
    const role=1;
    console.log(req.body);
    console.log("username:",username);
    console.log(password);
    pool.query('SELECT * from user where user_name=? and admin=?',[username,role] ,(error,result,fields)=>{
        if (error) console.log(error);
        if(result[0]){
            if(result[0].password===password){
                const token=jwt.sign({username:username},process.env.JWT_SECRET)
                // res.json({message:"login successful"})
                pool.query('SELECT * FROM flight', (error, results) => {
                    if (error) {
                        console.error('Error fetching flights:', error);
                        res.status(500).send('Error fetching flights');
                    } else {
                        // Render admin page and pass available flights data
                        res.render('admin/home', { flights: results });
                    }
                });
            }
            else{
                res.send('Login failed! incorrect password')
            }
        }
        else{
            res.send("admin not found!")
        }
    });//authentification is working!
})


// Route to render admin page with available flights
// app.get('/', (req, res) => {
//     // Fetch available flights from the database
//     pool.query('SELECT * FROM flight', (error, results) => {
//         if (error) {
//             console.error('Error fetching flights:', error);
//             res.status(500).send('Error fetching flights');
//         } else {
//             // Render admin page and pass available flights data
//             res.render('admin/home', { flights: results });
//         }
//     });
// });

router.post('/add-flight', (req, res) => {
    // Extract flight details from the request body
    const { flightID, departure, destination, departureTime, arrivalTime } = req.body;

    // Perform database insertion
    pool.query('INSERT INTO flight (flightID, departure, destination, departureTime, arrivalTime) VALUES (?, ?, ?, ?, ?)',
        [flightID, departure, destination, departureTime, arrivalTime],
        (error, results) => {
            if (error) {
                console.error('Error adding flight:', error);
                res.status(500).send('Error adding flight');
            } else {
                res.redirect('/admin'); // Redirect back to admin page after adding flight
            }
        });
});

router.post('/update-flight', (req, res) => {
    // const flightID = req.params.flightID;
    // Extract updated flight details from the request body
    const {flightID,departure, destination, departureTime, arrivalTime } = req.body;

    // Perform database update
    pool.query('UPDATE flight SET departure = ?, destination = ?, departureTime = ?, arrivalTime = ? WHERE flightID = ?',
        [departure, destination, departureTime, arrivalTime, flightID],
        (error, results) => {
            if (error) {
                console.error('Error updating flight:', error);
                res.status(500).send('Error updating flight');
            } else {
                res.redirect('/admin'); // Redirect back to admin page after updating flight
            }
        });
});

router.post('/remove-flight', (req, res) => {
    const {flightID} = req.body;
    // Perform database deletion
    pool.query('DELETE FROM flight WHERE flightID = ?', [flightID], (error, results) => {
        if (error) {
            console.error('Error removing flight:', error);
            res.status(500).send('Error removing flight');
        } else {
            res.redirect('/admin'); // Redirect back to admin page after removing flight
        }
    });
});
router.post('/users',(req,res)=>{
    pool.query('SELECT * FROM user', (error, results) => {
        if (error) {
            console.error('Error fetching flights:', error);
            res.status(500).send('Error fetching flights');
        } else {
            // Render admin page and pass available flights data
            res.render('admin/users', { users: results });
        }
    });
});

module.exports=router