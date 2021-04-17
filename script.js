const express = require("express")
const nodemailer = require('nodemailer');
require("dotenv").config();
const { v4: uuidv4 } = require('uuid');
const UsersCheck = require("./data/Users.json")
const fs = require("fs")
const bcrypt = require('bcrypt');
const session =require("express-session")
const flash = require("connect-flash")
const myPlaintextPassword = 's0/\/\P4$$w0rD';
const someOtherPlaintextPassword = 'not_bacon';



const app = express()

app.listen(3003,() => {
  console.log("listening port 3003")
})
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));



    app.use(express.cookieParser('keyboard cat'));
     app.use(express.session({ cookie: { maxAge: 60000 },
    resave:false,
    saveUninitialized:false
    }));
    app.use(flash());









app.get("/", (req,res) => {
  
    res.render("pages/index")
})

app.get("/login", (req,res) => {
  
    res.render("pages/login")
})




app.post('/send', async (req, res) => {
  

    
    const hashedPassword = await bcrypt.hash(req.body.password, 10)
    const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: process.env.user,
            pass: process.env.pass
        }
    });

// console.log(userss)

    if(  UsersCheck.some( elt => elt['email'] === req.body.email )){
        req.flash('info', 'Flash is back!')
      
        res.redirect("pages/login")
    }


    let id = uuidv4()
    let confirmCode = "http://localhost:3003/confirm/"+id
       let newUser = {
           id:id,
           
           firstname: req.body.firstname,
           lastname: req.body.lastname,
           email: req.body.email,
           status: "pending",
           confirmationCode: confirmCode,
           password: hashedPassword
   
       }


    let info = transporter.sendMail({
        from: '"Super Sean 👻" <YourEmail>', // sender address
        to: req.body.email, // list of receivers
        subject: "SUPER BOY ✔", // Subject line
        text: "DU BIST SUPER?", // plain text body
        html: `<p>please confirm your registration with this link </p> <br> <a href=${confirmCode}>Click here to confirm Email</a>`,
        

    }, (err, info) => {
        if (err) {throw err
        }else{

            fs.readFile("./data/Users.json","utf-8", (err,data) => {
                if(err) {throw err
                }else{
                 const infoo =JSON.parse(data)
                 infoo.push(newUser)
                    try{
                   
                    }catch (err){
                        console.log("error")
                    }
                
             
             
             
             fs.writeFile("./data/Users.json", JSON.stringify(infoo), err =>{
                 if(err){ throw err
                 }else{
                     console.log("file written")
                 }
             })
             
             
                }
              })
        }

    });


 



   

    res.render('pages/registration')
})



 //==========Confirm request =========== //
app.get("/confirm/:id",(req,res) => {




    fs.readFile("./data/Users.json","utf-8", (err,data) => {

        if(err) {throw err
        }else{
         const infoo =JSON.parse(data)
         const pendingUser  = infoo.find((elt) => {
          return elt.id === req.params.id                     
          })
          console.log(pendingUser,"pendingUser")
          pendingUser.status = "active"
          const pendingOutfiltered = infoo.filter((elt) => {
            return elt.id !== req.params.id
          })
          pendingOutfiltered.push(pendingUser)

          fs.writeFile("./data/Users.json", JSON.stringify(pendingOutfiltered), err =>{
            if(err){ throw err
            }else{
                console.log("file written")
            }
        })
        //   console.log(JSON.stringify(pendingOutfiltered))
        }
    })

console.log(req.params.id)
  res.render("pages/confirmed")
})