const https=require("https");
const path=require("path")
const indexRouter=require('./routes/index')
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
app.use(express.urlencoded());

// app.get("/",(req,res)=>{
//     const con="hey there join my crew";
//     const params={'title':'luffy is recruiting nigga! ',content:con};
//     res.status(200).render('home',params)
// })

// app.post("/",(req,res)=>{
//     console.log(req.body);
//     const params={'message':'your form has been received successfully '};
//     res.status(200).render('home',params)
// })

app.use('/',indexRouter);//we tell which router to handle the route
//integrate database

const port=3000;

app.listen(process.env.PORT||3000,()=>{
    console.log(`this application started successfully on port:${port}`);
})