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
const seatsRouter=require('./routes/seatSelection')
const adminRouter=require('./routes/Admin')
const paymentRouter=require('./routes/payment')

const expressLayouts=require('express-ejs-layouts');

const express=require("express");


const app=express();
app.set('views',path.join(__dirname,'views'));
app.set('layout','layouts/layout')
app.use(expressLayouts);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

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
app.use('/booking',bookingRouter);
app.use('/admin',adminRouter);
app.use('/payment',paymentRouter);
app.use('/seatSelection',seatsRouter);//we tell which router to handle the route
//integrate database

  const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : process.env.MY_SQL_HOST,
    user            : process.env.MY_SQL_USER,
    password        : process.env.MY_SQL_PASSWORD,
    database        : process.env.MY_SQL_DATABASE
  });

app.post('/submit_contact_form', (req, res) => {
  // Assuming you're using body-parser middleware to parse form data
  const { name, email, message } = req.body;

  // Here you can perform any desired action with the form data
  // For example, you could save it to a database, send an email, etc.
  console.log('Received form submission:');
  console.log('Name:', name);
  console.log('Email:', email);
  console.log('Message:', message);

  // Respond to the client
  res.send('Form submission received. Thank you!');
});

const port=8080;

app.listen(process.env.PORT||8080,()=>{
    console.log(`this application started successfully on port:${port}`);
})