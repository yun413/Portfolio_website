var express = require("express");
var server = express();
var bodyParser = require("body-parser");



var fileUpload = require("express-fileupload");

server.use(express.static(__dirname + "/Public"));
server.use(bodyParser.urlencoded());
server.use(bodyParser.json());
server.use(fileUpload({limits:{fileSize:2*1024*1024}}))

var DB=require("nedb-promises");
var PorfolioDB = DB.create(__dirname+"/Porfolio.db");




server.get("/portfolio", (req, res) => {
    PorfolioDB.find({}).then(results=>{
        res.send(results);
    })
    
})






// 1. 新增作品
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
        
        if (err) return res.send("檔案上傳失敗。"); 

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

// 2.查找
server.get("/portfolioSearch", (req, res) => {
    // 使用 findOne 找單一資料
    PorfolioDB.findOne({ 
        category: req.query.category, 
        title: req.query.title 
    }).then(result => {
        // 如果找不到 result 會是 null
        res.send(result); 
    }).catch(err => {
        res.status(500).send("資料庫查詢失敗");
    });
});

//3. 處理刪除作品 (包含驗證碼確認) ---
server.post("/deletePortfolio", (req, res) => {
    var { category, title, confirmCode } = req.body;

    if (title !== confirmCode) {
        return res.send("<script>alert('刪除失敗：確認碼與作品名稱不符！'); window.location.href='/admin.html';</script>");
    }

    PorfolioDB.remove({ category: category, title: title }, {}).then((numRemoved) => {
        if (numRemoved > 0) {
            // 刪除成功後直接回到管理頁面
            res.send("<script>alert('作品已永久刪除'); window.location.href='/admin.html';</script>");
        } else {
            res.send("<script>alert('找不到作品，請重新確認'); window.location.href='/admin.html';</script>");
        }
    });
});

server.listen(8080, () => {
    console.log("已成功開啟 請至 http://localhost:8080");
});