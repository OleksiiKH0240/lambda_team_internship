import express from 'express';
import { generateResponse } from './Correctarium_Algo.js'

const app = express();

app.use(express.json())

app.get("/", function (req, res) {
    // console.log(req.body);
    if (Object.keys(req.body).length != 0) {
        const documentDetails = req.body;
        console.log(documentDetails);
        const response = generateResponse(documentDetails);
        res.send(response);
    }
    else {
        res.send("Hello World!")
    }

})

app.listen(80, () => {
    console.log("app is listening on port 80")
})
