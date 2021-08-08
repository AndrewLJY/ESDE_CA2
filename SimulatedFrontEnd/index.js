// const express=require('express');
// const serveStatic=require('serve-static');
// var app=express();

// // var hostname="3.214.213.44";
// // var port=3001;
// // The certificate is at "./localhost.pem" and the key at "./localhost-key.pem"
// const https = require('https');
// const fs = require('fs');
// const options = {
//   key: fs.readFileSync("../../localhost-key.pem"),
//   cert: fs.readFileSync("../../localhost.pem"),
// };
// https
//   .createServer(options, app)
//   .listen({port: 3001});


// app.use(function(req,res,next){
//     console.log(req.url);
//     console.log(req.method);
//     console.log(req.path);
//     console.log(req.query.id);
//     //Checking the incoming request type from the client
//     if(req.method!="GET"){
//         res.type('.html');
//         var msg='<html><body>This server only serves web pages with GET request</body></html>';
//         res.end(msg);
//     }else{
//         next();
//     }
// });


// app.use(serveStatic(__dirname+"/public"));


// app.get("/", (req, res) => {
//     res.sendFile("/public/home.html", { root: __dirname });
// });


// // app.listen(port,hostname,function(){

// //     console.log(`Server hosted at http://${hostname}:${port}`);
// // });


const express=require('express');
const serveStatic=require('serve-static');

var hostname="ec2-52-22-178-234.compute-1.amazonaws.com";
var port=3001;

var app=express();


app.use(function(req,res,next){
    console.log(req.url);
    console.log(req.method);
    console.log(req.path);
    console.log(req.query.id);
    //Checking the incoming request type from the client
    if(req.method!="GET"){
        res.type('.html');
        var msg='<html><body>This server only serves web pages with GET request</body></html>';
        res.end(msg);
    }else{
        next();
    }
});


app.use(serveStatic(__dirname+"/public"));


app.get("/", (req, res) => {
    res.sendFile("/public/home.html", { root: __dirname });
});


app.listen(port,hostname,function(){

    console.log(`Server hosted at http://${hostname}:${port}`);
});
