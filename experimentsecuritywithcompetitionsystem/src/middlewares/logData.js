var fs = require("fs");

module.exports.logInfo = function (req, res, next) {
    console.log("[----------------------- SERVICING LOG INFO ---------------------]");

    var logEntry = "";
    //get date + time
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();

    //logEntry += '[' + date + ' ' + time + '] Response code: ' + response + ' Message: ' + message + ' ---end {' + ip + '}\n';

    //console.log(logEntry);

    //fs.appendFile("server_log.txt", logEntry, function (writer) { //edits stats file
    //});

    next();
}
