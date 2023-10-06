import express from "express"

const app = express();

app.use(express.json());

app.post("/", (req, res) => {
    if (req.body != undefined && req.body["link"] != undefined) {
        const urlToShort = req.body["link"];
        console.log(urlToShort);
    }
    else {
        res.send("you didn't specify either link in the body of the post request or the body itself.")
    }
})


app.listen(443, () => {
    console.log("app is listening on port 443.")
})
