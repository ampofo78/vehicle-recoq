const express = require('express');
const helmet = require('helmet')
const cors = require('cors')
const bodyParser = require('body-parser')
const session = require('express-session')
const mysql = require('mysql')
const sqlSession = require('express-mysql-session')(session)
const cookieParser = require('cookie-parser')
const app = express();
const userAgent = require('express-useragent');
const path = require('path');
require('dotenv').config()








app.use(express.urlencoded({
   extended:true,
}));
app.use(cookieParser())

app.use(express.json())


const connection = mysql.createConnection({
    host:process.env.host,
    user:process.env.user,
    password:process.env.password,
    database:process.env.database,
})

connection.connect((err)=>{
if (err) {
    console.log(err)
}
else{
    console.log("connected")
}
})




const Store = new sqlSession({
    expiration: 60*60*24*1000,
    createDatabaseTable: true,
    schema:{
        tableName:"sessiontbl",
        columnNames:{
            session_id:"session_id",
            expires:"expires",
            data:"data"
        }
    }
},connection)

app.use(session({
     secret: `Math.floor(Math.random() * 9999 + 1)Rand`,
     saveUninitialized:false,
     resave:false,
     store:Store,
     cookie:{maxAge:60*60*24*1000}
}))


app.use(express.static(path.join(__dirname,'/public')))
app.use(userAgent.express())

app.set('views',path.join(__dirname,'/Views'))
app.engine('hbs',require('express-handlebars').engine({
    extname:'hbs',
    defaultLayout: 'main.hbs',
    layoutsDir:path.join(__dirname,'/Views/Layouts')
}))

app.set('view engine','hbs')

app.get('/',(req,res)=>{
 return res.render('IndexView',{layout:'IndexLayout'})
})

app.get('/Dashboard',(req,res)=>{
    if (req.session.authenticatedUser) {
        connection.query(`SELECT count(*) AS total From numberplates`,(err1,result1)=>{
            connection.query(`SELECT count(*) AS totalCommercials From numberplates WHERE PlateType = 'commercial' `,(err2,result2)=>{
                               

                connection.query(`SELECT count(*) AS totalPrivates From numberplates WHERE PlateType = 'private' `,(err3,result3)=>{


                    connection.query(`SELECT count(*)  AS totalGovernments From numberplates WHERE PlateType = 'government' `,(err4,result4)=>{




                        if (err1 || err2 || err3 || err4) {
                            console.log(err1 || err2 || err3 || err4)
                         }
                         else{
                           
                            return res.render('DashboardView',{layout:'DashboardLay',total:result1[0].total,totalCommercials:result2[0].totalCommercials,totalPrivates:result3[0].totalPrivates,totalGovernments:result4[0].totalGovernments,username:req.session.authenticatedUser.Username})
                         }
            
                    })

                })
            })
        })
       
    }
    else{
        res.redirect(302,"/")
    }
   })

   app.get('/Profile',(req,res)=>{
    if (req.session.authenticatedUser) {
        return res.render('ProfileView',{layout:'ProfileLay',username:req.session.authenticatedUser.Username})
    }
    else{
        res.redirect(302,"/")
    }
   })
   app.post("/login",(req,res)=>{
        const{Username,Password} = req.body;
        const queri = `Select * From  profile WHERE username = '${Username}'   AND  password = '${Password}'`
       connection.query(queri,(err,result)=>{
if (err) {
console.log(err)
}
else if(result.length === 0){
   
        return  res.render("IndexView",{layout:"IndexLayout",data:"Incorrect Username or Password"})
    
}
else{
   
       req.session.authenticatedUser = {Username:Username,Password:Password};
        res.redirect(302,'/Dashboard')
    
}
       })
   })
   
   

app.get("/logout",(req,res)=>{
        if (req.session.authenticatedUser) {
            req.session.destroy((err)=>{
                if (err) {
                  console.log(err)  
                }
                else{
                    res.redirect(302,"/")
                }
            })
        }
})


app.post("/addUser",(req,res)=>{
     const{Username,Password} = req.body;
     if (req.session.authenticatedUser) {
                  connection.query(`SELECT * From profile WHERE username = '${Username}' AND password = '${Password}'`,(err,resulter)=>{
                    if (resulter) {
                        res.render('ProfileView',{layout:'ProfileLay',data:{res:"User Already Exist",color:"red"},username:req.session.authenticatedUser.Username})
                    }
                    else{
                        connection.query(`INSERT INTO profile(username,password) VALUES('${Username}','${Password}')`,(err,result)=>{
                            if (err) {
                                res.render("ProfileView",{layout:"ProfileLay",data:{res:"Error In Saving",color:"red"},username:req.session.authenticatedUser.Username})
                            }
                            else{
                                res.render("ProfileView",{layout:"ProfileLay",data:{res:"Data Saved",color:"green"},username:req.session.authenticatedUser.Username})
                            }
                        })
                    }
                  })
     //here
     }
     else{
        res.redirect(302,"/")
     }
})


//Api to Arduino
app.get("/carType",(req,res)=>{
      const data = req.query.type;
      if (data) {
        connection.query(`INSERT INTO numberplates(PlateType) VALUES('${data}')`,(err,result)=>{
              if (err) {
                res.json({flag:"error"}).status(400)
              }
              else{
                res.json({flag:"OK"}).status(200)
              }
        })
      }
      else{
        res.json({flag:"error"}).status(400)
      }
})


app.get("/Commercials", (req,res)=>{
    if (req.session.authenticatedUser) {
        return res.render('CommercialView',{layout:'CommercialLayout',username:req.session.authenticatedUser.Username})
    }
    else{
        res.redirect(302,"/")
    }
})


app.get("/Privates", (req,res)=>{
    if (req.session.authenticatedUser) {
        return res.render('PrivateView',{layout:'PrivateLayout',username:req.session.authenticatedUser.Username})
    }
    else{
        res.redirect(302,"/")
    }
})




app.get("/Governments", (req,res)=>{
    if (req.session.authenticatedUser) {
        return res.render('GovernmentView',{layout:'GovernmentLayout',username:req.session.authenticatedUser.Username})
    }
    else{
        res.redirect(302,"/")
    }
})

app.post("/commSearch",(req,res)=>{
   if (req.session.authenticatedUser) {
    const{carDate} = req.body;
    if (carDate) {
        connection.query(`SELECT * From numberplates WHERE PlateType = 'commercial' AND Date(Date) ='${carDate}'`,(err1,result1) =>{
            connection.query(`SELECT count(*) AS carCountOnDate From numberplates WHERE PlateType = 'commercial' AND Date(Date) ='${carDate}'`,(err2,result2) =>{
             if (err1 || err2) {
               console.log(err1||err2) 
             }
             else{
                return res.render('CommercialView',{layout:'CommercialLayout',carCountOnDate:result2[0].carCountOnDate,carsOnThisDate:result1})
             }
            })
        })
    }
   }
   else{
    res.redirect(302,"/")
   }
})



app.post("/privateSearch",(req,res)=>{
   
   if (req.session.authenticatedUser) {
    const{carDate} = req.body;
    if (carDate) {
        connection.query(`SELECT * From numberplates WHERE PlateType = 'private' AND Date(Date) ='${carDate}'`,(err1,result1) =>{
            connection.query(`SELECT count(*) AS carCountOnDate From numberplates WHERE PlateType = 'private' AND Date(Date) ='${carDate}'`,(err2,result2) =>{
             if (err1 || err2) {
               console.log(err1||err2) 
             }
             else{
                return res.render('PrivateView',{layout:'PrivateLayout',carCountOnDate:result2[0].carCountOnDate,carsOnThisDate:result1})
             }
            })
        })
    }
   }
   else{
    res.redirect(302,"/")
   }
})


app.post("/governmentSearch",(req,res)=>{
   
    if (req.session.authenticatedUser) {
     const{carDate} = req.body;
     if (carDate) {
         connection.query(`SELECT * From numberplates WHERE PlateType = 'government' AND Date(Date) ='${carDate}'`,(err1,result1) =>{
             connection.query(`SELECT count(*) AS carCountOnDate From numberplates WHERE PlateType = 'government' AND Date(Date) ='${carDate}'`,(err2,result2) =>{
              if (err1 || err2) {
                console.log(err1||err2) 
              }
              else{
                 return res.render('GovernmentView',{layout:'GovernmentLayout',carCountOnDate:result2[0].carCountOnDate,carsOnThisDate:result1})
              }
             })
         })
     }
    }
    else{
     res.redirect(302,"/")
    }
 })





app.listen(5000, () => {
    console.log(`Server started on port`);
});

//username:req.session.authenticatedUser.Username