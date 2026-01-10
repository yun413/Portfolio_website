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
        res.render("msg", { message: "傳送失敗，請再次嘗試。" });
    });
})



// 1. 修改新增作品路由
server.post("/addPortfolio", (req, res) => {
    if (!req.files || !req.files.workFile) {
        return res.send("請選擇檔案，務必小於2MB");
    }
    var file = req.files.workFile;
    var fileName = Date.now() + "_" + file.name;
    
    // 請務必在你的電腦中手動建立 Public/upload 資料夾
    var savePath = __dirname + "/Public/upload/" + fileName; 
    var webPath = "/upload/" + fileName;

    file.mv(savePath, (err) => {
        // 這裡的錯誤訊息要跟著路徑修正
        if (err) return res.send("檔案上傳失敗，請檢查 Public/upload 資料夾是否存在。"); 

        var newData = {
            category: req.body.category,
            title: req.body.title,
            author: req.body.author,
            filePath: webPath
        };

        PorfolioDB.insert(newData).then(() => {
            res.send("<script>alert('新增成功!');window.location.href='/admin.html';</script>");
        });
    });
});

// 2. 新增一個 API，讓 admin.html 可以根據類型抓取目前所有的作品名稱
server.get("/getPortfolioNames", (req, res) => {
    PorfolioDB.find({ category: req.query.category }).then(results => {
        res.send(results);
    });
});

//3. 處理刪除作品 (包含驗證碼確認) ---
server.post("/deletePortfolio", (req, res) => {
    var category = req.body.category;
    var title = req.body.title;
    var confirmCode = req.body.confirmCode;

    // 驗證確認碼是否等於作品名稱
    if (title !== confirmCode) {
        return res.send("<script>alert('刪除失敗：確認碼不正確！'); window.location.href='/admin.html';</script>");
    }

    // 執行刪除
    PorfolioDB.remove({ category: category, title: title }, {}).then((numRemoved) => {
        if (numRemoved > 0) {
            res.send("<script>alert('作品已刪除'); window.location.href='/admin.html';</script>");
        } else {
            res.send("<script>alert('找不到該作品，無法刪除'); window.location.href='/admin.html';</script>");
        }
    });
});

server.listen(8080, () => {
    console.log("已成功開啟 請至 http://localhost:8080");
});