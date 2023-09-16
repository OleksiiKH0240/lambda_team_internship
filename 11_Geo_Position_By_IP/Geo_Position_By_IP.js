import express from "express";
import {getInfoByIp} from './database_utils.js'

const app = express();



app.get("/", function (req, res) {
    // const ip = req.socket.remoteAddress;
    const ip = req.headers["x-forwarded-for"];
    // console.log(ip);

    const ipInfo = getInfoByIp(ip);
    ipInfo["yourIp"] = ip;
    console.log(ipInfo);
    res.send(ipInfo);
});

app.listen(80, function () {
    console.log("app is listening on port 80")
});
