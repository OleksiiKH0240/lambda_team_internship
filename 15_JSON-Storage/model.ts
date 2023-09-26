import { MongoClient } from 'mongodb';


// const routesJsonMap: Map<string, object> = new Map();

class JsonStorageModel {
    isDbMode: boolean = false;
    mongoUrl: string;
    dbClient: MongoClient | null = null;
    routesJsonMap: Map<string, object> | null = new Map();


    constructor(mongoUrl: string = "mongodb://localhost:27017/test") {
        this.mongoUrl = mongoUrl;
    }

    async setup() {
        try {
            this.dbClient = new MongoClient(this.mongoUrl, { serverSelectionTimeoutMS: 2000 });
            await this.dbClient.connect();
            console.log("Connection to MongoDb database was established successfully.");
            this.isDbMode = true;

            this.routesJsonMap = null;
        }
        catch (error) {
            console.log("error occured during the connection to database.");
            console.log("No DB mode will be used.");
            this.isDbMode = false;
            // this.routesJsonMap = new Map();
        }
    }

    async addJson(routeToSave: string, json: object): Promise<void> {
        if (this.isDbMode == true) {
            const db = this.dbClient!.db("my_db");
            const jsons = db.collection("jsons");
            await jsons.insertOne({ "routeToSave": routeToSave, "json": json });
        }
        else {
            this.routesJsonMap!.set(routeToSave, json);
            console.log(this.routesJsonMap);
        }
        console.log(`json was added with route: ${routeToSave}`);
    }

    async updateJsonByRoute(routeToSave: string, newJson: object) {
        if (this.isDbMode == true) {
            const db = this.dbClient!.db("my_db");
            const jsons = db.collection("jsons");
            const query: object = { "routeToSave": routeToSave };
            await jsons.updateOne(query, { "$set": { "routeToSave": routeToSave, "json": newJson } });
        }
        else {
            this.routesJsonMap!.set(routeToSave, newJson);
            console.log(this.routesJsonMap);
        }
        console.log(`json with route: ${routeToSave} was updated.`);
    }

    async getJsonByRoute(routeToSave: string): Promise<object | null> {
        if (this.isDbMode == true) {
            const query: object = { "routeToSave": routeToSave };
            const db = this.dbClient!.db("my_db");
            const json: object | null = await db.collection("jsons").findOne(query);
            return json;
        }
        else {
            const res: object | undefined = this.routesJsonMap!.get(routeToSave);
            const json: object | null = res === undefined ? null : res;
            // console.log(json);
            return json;
        }
    }

    async getAllRoutes() {
        if (this.isDbMode == true) {
            const db = this.dbClient!.db("my_db");
            const routes = await db.collection("jsons").find({}).toArray();
            // console.log(routes);
            return routes
        }
    }

    closeConn() {
        if (this.isDbMode == true) {
            this.dbClient!.close();
        }
        else {
            console.log("database is not used.");
        }
    }
}

export { JsonStorageModel };

// await new JsonStorageModel().getAllRoutes();
