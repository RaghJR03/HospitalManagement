var con=require("./connection");
const express=require('express');
const app=express();
const port=3000;
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }))
const path=require('path');
app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));
app.use(express.static("public"));




app.get('/', (req, res) => {
    res.render('home');
    });

    
app.get('/contact', (req, res) => {
    res.render('contact');
    });

app.get('/login', (req, res) => {
      res.render('login');
 });

 app.post("/login",(req,res)=>{
   const sname=req.body.sname;
    const email=req.body.email;
    const pid=req.body.pid;
    const password=req.body.password;
   
     console.log("sucessfully logged in")
        res.render("home",{sname:sname,email:email,pid:pid,password:password,log:"1"});
 })

 app.post("/register",(req,res)=>{
    const sname=req.body.sname;
    const email=req.body.email;
    const pid=req.body.pid;
    const password=req.body.password;
    const cnfpassword=req.body.cnfpassword;
    
    if(password===cnfpassword)
    {
        console.log("sucessfully registerd")
        res.render("home",{sname:sname,email:email,pid:pid,password:password,log:"1"});
    }
    else
    {
       
        console.log("your password didnt match")
        res.render("register",{log:"0"});
    }
    
 })
 app.get('/logout', (req, res) => {
    res.render('logout');
});


 app.get('/appointments', (req, res) => {
    res.render('appointments');
    });

    app.get('/register', (req, res) => {
        res.render('register');
        });


app.listen(port,()=>{
    console.log(`server running on port ${port}`);
})