import express from "express";
import { db } from "./database";
import * as schemas from "./schemas";
import { eq, and } from 'drizzle-orm';
import crypto from "crypto";


const app = express();


app.use(express.json());

const separator = "-";
const hashLengthLimit = 6;

app.post("/", async (req, res) => {
    if (req.body != undefined && req.body["url"] != undefined) {
        const urlToShort = req.body["url"];
        const urlHash = crypto.createHash("sha256").update(urlToShort).digest("hex").slice(0, hashLengthLimit);
        const possibleUrls = await db.select().from(schemas.UrlsStorage).where(eq(schemas.UrlsStorage.urlHash, urlHash));

        if (possibleUrls.length == 0) {
            await db.insert(schemas.UrlsStorage).values({ urlHash: urlHash, realUrl: urlToShort, numberInGroup: 1 });
            res.status(200).json({ "shorted_url": `${req.hostname}/${urlHash}${separator}1` });
        }
        else {
            for (const urlObj of possibleUrls) {
                if (urlObj.realUrl == urlToShort) {
                    res.status(200).json({ "shorted_url": `${req.hostname}/${urlObj.urlHash}${separator}${urlObj.numberInGroup}` });
                    return;
                }
            }

            const numberInGroup = possibleUrls.length + 1;
            await db.insert(schemas.UrlsStorage).values({ urlHash: urlHash, realUrl: urlToShort, numberInGroup: numberInGroup });
            res.status(200).json({ "shorted_url": `${req.hostname}/${urlHash}${separator}${numberInGroup}` });
        }
    }
    else {
        res.send("you didn't specify either link in the body of the post request or the body itself.")
    }
})


app.get("/:shortedUrl", async (req, res) => {
    const shortedUrl = req.params.shortedUrl;
    if (shortedUrl != undefined) {
        let urlHash, numberInGroup;
        [urlHash, numberInGroup] = shortedUrl.split(separator);
        numberInGroup = parseInt(numberInGroup);
        const url = await db.select().from(schemas.UrlsStorage).where(
            and(
                eq(schemas.UrlsStorage.urlHash, urlHash),
                eq(schemas.UrlsStorage.numberInGroup, numberInGroup)));
        if (url.length == 0) {
            res.send("unknown short url.");
        }
        else if (url.length == 1){
            res.redirect(url[0].realUrl);
        }
        else{
            res.send("bullshit");
        }
    }

})

app.get("/", (req, res) => {
    console.log(req.hostname);
    console.log(req.socket.remoteAddress);
    console.log(req.socket.localPort);
    res.sendStatus(200);
})

app.listen(80, () => {
    console.log("app is listening on port 80.")
})

// console.log(crypto.createHash("sha256").update("urlToShort").digest("hex").slice(0, 5));
