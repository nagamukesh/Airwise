const express=require('express')
const router=express.Router()
const https=require("https");
const mysql=require("mysql");
const path=require("path");
const dotenv= require('dotenv');
const jwt=require('jsonwebtoken');

dotenv.config()
const app=express()
const bodyParser=require("body-parser");
const encoder=bodyParser.urlencoded();
app.use(express.urlencoded({extended:false}))

router.get('/',(req,res)=>{
    res.render('booking/main')
})

router.get('/flight_bookings',(req,res)=>{
    res.render('booking/flight_bookings')
})

router.get('/flight_status',(req,res)=>{
    res.render('booking/flight_status')
})

router.get('/pnr_enquiry',(req,res)=>{
    res.render('booking/pnr_enquiry')
})

router.get('/flight_insurance',(req,res)=>{
    res.render('booking/flight_insurance')
})

router.get('/airline_info_schedules',(req,res)=>{
    res.render('booking/airline_info_schedules')
})

router.get('/offer_details',(req,res)=>{
    res.render('booking/offer_details')
})

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.MY_SQL_HOST,
    user            : process.env.MY_SQL_USER,
    password        : process.env.MY_SQL_PASSWORD,
    database        : process.env.MY_SQL_DATABASE
  });

router.post('/process',encoder,(req,res)=>{
    const ticket_ID=req.body.seatID;
    console.log(req.body)
    pool.query("select F.* from ticket T join flight F on T.flight_no = F.flightID where ticket_id=?",[ticket_ID],(error,result)=>{
        console.log(result);
        if (error) {
            console.error('Error fetching data:', error);
            res.status(500).json({ error: 'Error fetching data' });
        } else if (result.length === 0) {
            res.status(404).send("PNR not found");
        } else {
            console.log(result);
            res.render('booking/PNRResult', { PNR: result });
        }
    });
})

module.exports=router