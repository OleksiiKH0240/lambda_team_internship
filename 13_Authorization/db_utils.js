import mongodb from 'mongodb';


const mongoUrl = "mongodb://localhost:27017/test";

let dbClient;

async function createConn() {
    dbClient = new mongodb.MongoClient(mongoUrl);
    console.log("Connection to MongoDb database was established successfully.");
    // console.log(dbClient.options.dbName);
}

async function setupDb() {
    const db = dbClient.db("my_db");
    const collections = await db.listCollections().toArray();
    // console.log(collections);

    if ((collections.find((collection) => collection.name == "users")) == undefined) {
        await db.createCollection("users")
        console.log("Collection users was created.");
    }
}

async function addUser(data) {
    // dbClient = new mongodb.MongoClient(mongoUrl);
    const db = dbClient.db("my_db");
    const users = db.collection("users");
    const result = await users.insertOne(data);
    console.log(`user was created with id: ${result.insertedId}`);
    // await dbClient.close();
}

async function getUserByEmail(email) {
    const query = { "email": email };
    const db = dbClient.db("my_db");
    const user = await db.collection("users").findOne(query);
    return user;
}

async function closeConn() {
    await dbClient.close();
    console.log("Connection to database was closed.")
}

export { createConn, setupDb, addUser, getUserByEmail, closeConn };

// await createConn();

// await setupDb();
// await addUser({ user_name: "alex", user_sex: "male", useruser_credential: { email: "a@gmail.com", password: "123" } });
// console.log(await getUserByEmail("c@gmail.com"));

// await closeConn();
