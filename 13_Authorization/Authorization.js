import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import express from 'express';
import { createConn, setupDb, addUser, getUserByEmail, closeConn } from './db_utils.js';

dotenv.config();

const tokenSecret = process.env["TOKEN_SECRET"];

const app = express();

app.use(express.json());

function authenticateToken(req, res, next) {
    let token = req.headers["authorization"];

    token = token.includes("Bearer ") ? token.split(" ")[1] : token;
    jwt.verify(token, tokenSecret, (err) => {
        if (err) return res.sendStatus(401);

        next();
    })

}


app.post("/sign_up", async (req, res) => {
    const email = req.body.email, password = req.body.password;
    if (email == undefined || password == undefined) {
        res.sendStatus(404);
    }
    else {
        console.log(email, password);
        await addUser({ "email": email, "password": password });

        res.sendStatus(200);
    }

})


app.post("/login", async (req, res) => {
    const email = req.query["email"], password = req.query["password"];
    console.log(email, password);
    const user = await getUserByEmail(email);

    if (user == null) {
        res.send("invalid email or password");
    }
    else {
        if (user.password != password) {
            res.send("invalid email or password");
        }
        else {
            const ttl = 30 + Math.floor(Math.random() * 60);
            const accessToken = jwt.sign({ "email": email, "token_type": "access_token" }, tokenSecret, { expiresIn: ttl });
            const refreshToken = jwt.sign({ "email": email, "token_type": "refresh_token" }, tokenSecret);
            res.status(200).send({ "access_token": accessToken, "refresh_token": refreshToken });
        }
    }
})

app.get("/me:requestNum([0-9])", authenticateToken, (req, res) => {
    let token = req.headers["authorization"];
    token = token.includes("Bearer ") ? token.split(" ")[1] : token;

    const data = jwt.decode(token, tokenSecret);
    const tokenType = data["token_type"];

    if (tokenType == "access_token") {
        res.json({ "request_num": req.params.requestNum, "data": { "email": data["email"] } });
    }
    else {
        res.send("invalid token type");
    }

})

app.post("/refresh", authenticateToken, (req, res) => {
    let token = req.headers["authorization"];
    token = token.includes("Bearer ") ? token.split(" ")[1] : token;

    const data = jwt.decode(token, tokenSecret);
    const tokenType = data["token_type"];

    if (tokenType == "refresh_token") {
        const ttl = 30 + Math.floor(Math.random() * 60);
        const accessToken = jwt.sign({ "email": data["email"], "token_type": "access_token" }, tokenSecret, { expiresIn: ttl });
        res.json({ "access_token": accessToken });
    }
    else {
        res.send("invalid token type");
    }
})

try {
    await createConn();
    await setupDb();
    // await addUser({ email: "a@gmail.com", password: "123" });

    app.listen(80, () => {
        console.log("app is listening in port 80.")
    })

    // await closeConn();

} catch (error) {
    console.log(error);
    await closeConn();
}

