import pg from "pg";


const { dbInstanceAddress, postgresPort, postgresUser, dbName, postgresPassword } = process.env;

const postgresConfig = {
    host: dbInstanceAddress,
    port: Number(postgresPort),
    user: postgresUser,
    password: postgresPassword,
    database: dbName,
    ssl: true
};
console.log("postgresConfig", postgresConfig);

// const pool = new pg.Pool(postgresConfig);
// const client = await pool.connect();
// const client = undefined;
// console.log("connection to database was established successfully.");


export const shopIds = ["shop1", "shop2", "shop3", "shop4", "shop5"];

class ApprovedShopUsers {
    dbPool
    dbClient
    dbSchemaName

    constructor() {
        this.dbPool = undefined;
        this.dbClient = undefined;
        this.dbSchemaName = dbName;
    }

    openConn = async () => {
        this.dbPool = new pg.Pool(postgresConfig);
        this.dbClient = await this.dbPool.connect();
        console.log("connection to database was established successfully.");
    }

    closeConn = async () => {
        this.dbClient.release();
        await this.dbPool.end();
    }

    initDb = async () => {
        await this.openConn();

        await this.dbClient.query(`CREATE SCHEMA IF NOT EXISTS ${this.dbSchemaName};`);


        await this.dbClient.query(`
        CREATE TABLE IF NOT EXISTS ${this.dbSchemaName}.approved_users (
            user_id SERIAL PRIMARY KEY,
            username varchar(256),
            password varchar(256),
            search_phrase varchar(256),
            shop_id varchar(256)
        );`);
        await this.dbClient.query(`CREATE INDEX IF NOT EXISTS shop_id_index ON ${this.dbSchemaName}.approved_users (shop_id);`);


        await this.dbClient.query(`CREATE TABLE IF NOT EXISTS ${this.dbSchemaName}.shop_calls_count
        (
            shop_id varchar(256) unique,
            count   integer default 0
        );`)
        for (const shopId of shopIds) {
            await this.dbClient.query(`INSERT INTO ${this.dbSchemaName}.shop_calls_count(shop_id) 
            VALUES ('${shopId}') on conflict do nothing;`);
        }

        await this.closeConn();
    }

    addUser = async (user) => {
        await this.openConn();

        await this.dbClient.query(`INSERT INTO ${this.dbSchemaName}.approved_users (username, password, search_phrase, shop_id) 
        VALUES ('${user.username}', '${user.password}', '${user.searchPhrase}', '${user.shopId}');`);

        await this.dbClient.query(`UPDATE ${this.dbSchemaName}.shop_calls_count SET count = count + 1 
        WHERE shop_id = '${user.shopId}';`);

        await this.closeConn();
    }

    getShopCount = async (shopId) => {
        await this.openConn();

        const result = await this.dbClient.query(`SELECT count FROM ${this.dbSchemaName}.shop_calls_count WHERE shop_id = '${shopId}';`)

        await this.closeConn();
        return result.rows[0].count;
    }
}


const approvedShopUsers = new ApprovedShopUsers();
await approvedShopUsers.initDb();
console.log("database was initialized.")
export default approvedShopUsers;

// client.release();
// await pool.end();
