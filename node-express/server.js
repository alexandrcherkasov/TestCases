const express = require('express');
const app = express();
require("dotenv").config();
const port = 3004;
var md5 = require('md5')
var sqlite3 = require('sqlite3').verbose()
const cors = require('cors');
var jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const DBSOURCE = "usersdb.sqlite";
const auth = require("./middleware");
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    } 
    else {        
        var salt = bcrypt.genSaltSync(10);
        
        db.run(`CREATE TABLE Users (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            Username text, 
            Password text,
            Salt text
            )`,
        (err) => {
            if (err) {
                // Table already created
            }
        }),
        db.run(`CREATE TABLE Questions (
            Id INTEGER PRIMARY KEY AUTOINCREMENT,
            UserId  integer,
            Count integer,
            Question text
            
        )`,(err) => {
            if (err){
                // Table already created
            }
        });  
    }
});


module.exports = db

app.use(
    express.urlencoded(),
    cors({
        origin: 'http://localhost:3000'
    })
);

app.get('/', (req, res) => res.send('API Root'));



//*  G E T   A L L   Q U E S T I O N S

app.get("/api/question/:id", (req, res, next) => {
    try{
        var sql = "SELECT * FROM Questions WHERE UserId = ?"
        db.all(sql, req.params.id, (err, rows) => {
            if (err) {
              res.status(400).json({"error":err.message});
              return;
            }
            res.status(200);
            res.json({
                "message":"success",
                "data":rows
            })
            
          });
          
    }
    catch(err){
        console.log(err);
    }

})

app.post("/api/question/count",(req,res) => {
    try{
        const {Question} = req.body;
        var sql = "SELECT Sum(Count) as Sum FROM Questions WHERE Question = ?"
        params = [Question]
        console.log("select");
        db.all(sql,params,function(err,innterResult){
            console.log(innterResult);
            console.log(Question);
            if(err){
                res.status(400).json({"error":err.message});
                return
            }
            res.status(200);
            res.json({
                "message":"success",
                "data":innterResult
            })
            console.log("select 2");
        });
        console.log("select 3");
    }
    catch(err){
        console.log(err);
    }

});

//* C R E A T E / U P D A T E   Q U E S T I O N

app.post("/api/question", async (req, res) => {
    var errors=[]
    var sql
    var params
    try{
        const {UserId, Question} = req.body; 
        if (errors.length){
            res.status(400).json({"error":errors.join(",")});
            return;
        }

        sql = 'SELECT * FROM Questions WHERE Question = ?';
        params = [Question];
        db.all(sql,params,function(err,innerResult){
            if(err){
                throw new Error(err.message);
            }
            if(innerResult.length == 0){
                sql = 'INSERT INTO Questions (UserId,Question,Count) VALUES (?,?,1)';
                params = [UserId, Question];

                db.run(sql,params, function(err,innerResult) {
                    if(err){
                        res.status(400);
                    return;
                    }
                    res.status(201).json("Success");    
                });
            }
            else{
                sql = 'SELECT * FROM Questions WHERE Question = ? AND UserId = ?'
                params = [Question,UserId];
                db.all(sql,params, function(err,innerResult){
                    if(innerResult.length > 0){
                        sql = 'UPDATE Questions SET Count = Count + 1 WHERE Question = ? AND UserId = ? ';
                        db.run(sql,params,function(err){
                            if(err){
                                res.status(400);
                                return;
                            }
                            res.status(201).json("Success");    
                        })
                    }
                    else{
                        sql = 'INSERT INTO Questions (UserId,Question,Count) VALUES (?,?,1)';
                        params = [UserId, Question];

                        db.run(sql,params, function(err,innerResult) {
                            if(err){
                                res.status(400);
                            return;
                            }
                            res.status(201).json("Success");    
                        });
                    }
                });
            }
        });
    }
    catch(err){
        console.log(err);
    }
})

// * R E G I S T E R   N E W   U S E R

app.post("/api/register", async (req, res) => {
    var errors=[]
    try {
        const { Username, Password } = req.body;

        if (errors.length){
            res.status(400).json({"error":errors.join(",")});
            return;
        }
        let userExists = false;
        
        var sql = "SELECT * FROM Users WHERE Username = ?"        
        await db.all(sql, Username, (err, result) => {
            if (err) {
                res.status(402).json({"error":err.message});
                return;
            }
            
            if(result.length === 0) {                
                
                var salt = bcrypt.genSaltSync(10);

                var data = {
                    Username: Username,
                    Password: bcrypt.hashSync(Password, salt),
                    Salt: salt
                }
        
                var sql ='INSERT INTO Users (Username, Password, Salt) VALUES (?,?,?)'
                var params =[data.Username,data.Password,data.Salt]
                var user = db.run(sql, params, function (err) {
                    if (err){
                        res.status(400).json({"error": err.message})
                        return;
                    }
                  
                });           
            }            
            else {
                userExists = true;
                // res.status(404).send("User Already Exist. Please Login");  
            }
        });
  
        setTimeout(() => {
            if(!userExists) {
                res.status(201).json("Success");    
            } else {
                res.status(201).json("Record already exists. Please login");    
            }            
        }, 500);


    } catch (err) {
      console.log(err);
    }
})


// * L O G I N

app.post("/api/login", async (req, res) => {
  try {      
    const { Username, Password } = req.body;
        // Make sure there is an Email and Password in the request
        if (!(Username && Password)) {
            res.status(400).send("All input is required");
            return;
        }
            
        let user = [];
        
        var sql = "SELECT * FROM Users WHERE Username = ?";
        db.all(sql, Username, function(err, rows) {
            if (err){
                console.log("Fetch all data row from users table")
                res.status(400).json({"error": err.message})
            }

            rows.forEach(function (row) {
                user.push(row);                
            })

            if(user.length != 0){
                var PHash = bcrypt.hashSync(Password, user[0].Salt);
       
            if(PHash === user[0].Password) {
                // * CREATE JWT TOKEN
                const token = jwt.sign(
                    { user_id: user[0].Id, username: user[0].Username},
                      process.env.TOKEN_KEY,
                    {
                      expiresIn: "1h", // 60s = 60 seconds - (60m = 60 minutes, 2h = 2 hours, 2d = 2 days)
                    }  
                );

                user[0].Token = token;

            } else {
                return res.status(400).send("No Match");          
            }
            }
            else{
                return res.status(400).send("No Match");  
            }
           return res.status(200).send(user);                
        });	
    
    } catch (err) {
      console.log(err);
    }    
});

app.listen(port, () => console.log(`API listening on port ${port}!`));