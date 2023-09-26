import express from 'express';
import { JsonStorageModel } from './model';


const app = express();

app.use(express.json());

const myRouteRegExp: RegExp = /^\/([a-zA-Z0-9]\/{0,1})+$/;

const storageModel = new JsonStorageModel();

function setJsonHandler(routeToSave: string) {
    try {
        app.get(routeToSave, async (req, res) => {
            const json: object | null = await storageModel.getJsonByRoute(routeToSave);
            // console.log(json);
            if (json == null) {
                res.send(`there is no json with route: ${routeToSave}`);
            }
            else {
                if (storageModel.isDbMode == true){
                    res.status(200).json(json["json" as keyof typeof json]);
                }
                else {
                    res.status(200).json(json);
                }
                
            }
        });
    }
    catch (error) {
        console.log(error);
    }
}


app.post(myRouteRegExp, async (req, res) => {
    console.log(req.body);
    const myRouteToSave: string = req.path;
    const json: object | null = await storageModel.getJsonByRoute(myRouteToSave);

    if (json == null) {
        storageModel.addJson(myRouteToSave, req.body);

        setJsonHandler(myRouteToSave);

        res.status(200).send("json was successfully added.")
    }
    else {
        storageModel.updateJsonByRoute(myRouteToSave, req.body);
        res.status(200).send("json was successfully updated.")
    }
});

app.post(/.+/, (req, res) => {
    res.send("invalid route to save the json.")
})

app.listen(80, async () => {
    await storageModel.setup();

    console.log("app is running on port 80.");

    if (storageModel.isDbMode == true) {
        const routesObjs = await storageModel.getAllRoutes();
        if (routesObjs != undefined) {
            for (const routeObj of routesObjs) {
                setJsonHandler(routeObj["routeToSave"]);
            }
            console.log("routes was restored successfully.");
        }
    }
});

process.on('SIGINT', () => {
    if (storageModel.isDbMode == true) {
        storageModel.closeConn();
        console.log("Connection to database was closed.");
    }
    // console.log("hello");
    process.exit(0);
})


// node --loader ts-node/esm .\JSON-Storage.ts
