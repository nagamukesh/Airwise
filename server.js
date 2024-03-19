const https=require("https");
const mysql=require("mysql");
const path=require("path");
const dotenv= require('dotenv');
dotenv.config()
const bodyParser = require('body-parser');

const indexRouter=require('./routes/index')
const authorRouter=require('./routes/users')
const searchRouter=require('./routes/search')
const bookingRouter=require('./routes/booking')
const contactRouter=require('./routes/contact')

const expressLayouts=require('express-ejs-layouts');

const express=require("express");

const app=express();
app.set('views',path.join(__dirname,'views'));
app.set('layout','layouts/layout')
app.use(expressLayouts);

app.use('/static',express.static('static'));
app.use(express.static('public'));
//setting view engine to pug!
app.set('view engine','ejs');
// app.use(bodyParser.urlencoded({ extended: false }));
// app.use(bodyParser.json());

app.use('/',indexRouter);
app.use('/users',authorRouter);
app.use('/search',searchRouter);
app.use('/contact',contactRouter);
app.use('/booking',bookingRouter);//we tell which router to handle the route
//integrate database

  const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.MY_SQL_HOST,
    user            : process.env.MY_SQL_USER,
    password        : process.env.MY_SQL_PASSWORD,
    database        : process.env.MY_SQL_DATABASE
  });
   
  pool.query('SELECT * FROM users where user_id=2', function (error, results, fields) {
    if (error) throw error;
    console.log('The users are: ', results);
  });
   
// app.get('/login',(req,res)=>{
//   let sql='CREATE TABLE login (username varchar(20),password varchar(20))';
//   pool.query(sql,(err,result)=>{
//     if(err) throw err;
//     res.send('table created');
//   })
// });

const port=8080;

app.listen(process.env.PORT||8080,()=>{
    console.log(`this application started successfully on port:${port}`);
})