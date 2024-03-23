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
    res.render('search')
})

const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.MY_SQL_HOST,
    user            : process.env.MY_SQL_USER,
    password        : process.env.MY_SQL_PASSWORD,
    database        : process.env.MY_SQL_DATABASE
  });

router.post('/',encoder,async(req,res)=>{
    console.log(req.body.flightID);
    const flightID=req.body.flightID;
    console.log("flightID:",flightID)
    pool.query('SELECT flightID from flights where flightID=?',[flightID],(error,result,fields)=>{
        if(error){
            res.status(500).json({ error: 'Error fetching data' });
        }
        else if(result.length===0){
            res.status(404).send("flight not found");
        }
        else{
            res.render('searchResult', { flights: result });
        }
    })
})

router.post('/selectedFlight',(req,res)=>{
    res.render(selectedFlight);
})

module.exports=router