const https=require("https");
const path=require("path")
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

const port=80;

app.listen(process.env.PORT||80,()=>{
    console.log(`this application started successfully on port:${port}`);
})