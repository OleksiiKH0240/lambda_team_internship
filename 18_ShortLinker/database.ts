import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { migrate } from "drizzle-orm/mysql2/migrator";



dotenv.config();

// docker run --name mysql -p 3306:3306 -e MYSQL_DATABASE=urls_storage -e MYSQL_USER=mysql -e MYSQL_PASSWORD=mysql -e MYSQL_ROOT_PASSWORD=mysql -d mysql

// const MYSQL_ROOT_PASSWORD = process.env["MYSQL_ROOT_PASSWORD"];
const MYSQL_DATABASE = process.env["MYSQL_DATABASE"];
const MYSQL_USER = process.env["MYSQL_USER"];
const MYSQL_PASSWORD = process.env["MYSQL_PASSWORD"];


const connection = mysql.createPool({
    host: "localhost",
    port: 3306,
    user: MYSQL_USER,
    password: MYSQL_PASSWORD,
    database: MYSQL_DATABASE,
});

const db = drizzle(connection);


await migrate(db, { migrationsFolder: "./drizzle" });
console.log("database migration was successfully done.");


export { db, connection };

