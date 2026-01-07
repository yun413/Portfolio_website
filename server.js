var express = require("express");
var server = express();
var bodyParser = require("body-parser");


server.set("view engine", 'ejs');
server.set("views", __dirname+"/view")

var fileUpload = require("express-fileupload");

server.use(express.static(__dirname + "/Public"));
server.use(bodyParser.urlencoded());
server.use(bodyParser.json());
server.use(fileUpload({limits:{fileSize:2*1024*1024}}))

var DB=require("nedb-promises");
var ServiceDB = DB.create(__dirname+"/Service.db");
var PorfolioDB = DB.create(__dirname+"/Porfolio.db");
var ContactDB = DB.create(__dirname+"/Contact.db");

server.get("/", (req, res) => {
    res.send("Hello world!");
})
server.get("/services", (req, res) => {
    ServiceDB.find({},{_id:0}).then(results=>{
       
        res.send(results);
    }).catch(error=>{

    })
    
})

server.get("/portfolio", (req, res) => {
    PorfolioDB.find({}).then(results=>{
        res.send(results);
    })
    
})


server.get("/showServices",(req,res)=>{
    ServiceDB.find({},{_id:0}).then(results=>{
       
        res.render("service",{Services:results});
    }).catch(error=>{

    })

})

server.get("/about", (req, res) => {
    res.send("Welcome " + req.query.user + " to My first NodeJS server!");
})


server.post("/contact", (req, res) =>{
    ContactDB.insert(req.body)
    //move to public/upload
    .then(() => {
        res.render("msg", { message: "感謝 " + req.body.username + "，我們已收到您的訊息！" });
    })
    .catch(err => {
        res.render("msg", { message: "錯誤：" + err });
    });
})


server.listen(8080);