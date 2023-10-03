import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { migrate } from "drizzle-orm/mysql2/migrator";
import * as schemas from "./schemas";


dotenv.config();

// docker run --name mysql -p 3306:3306 -e MYSQL_DATABASE=crypto_markets -e MYSQL_USER=mysql -e MYSQL_PASSWORD=mysql -e MYSQL_ROOT_PASSWORD=mysql -d mysql

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

function getTimeFromDate(date: Date) {
    const timeString = date.toTimeString().split(" ")[0];

    return timeString.slice(0, timeString.length - 3);
}

function getHoursFromTime(timeStr: string) {
    const tokensList = timeStr.split(":");
    return parseInt(tokensList[0]);
}

function setHoursToTime(timeStr: string, hours: number){
    const tokensList = timeStr.split(":");
    tokensList[0] = hours < 10? `0${hours}` : hours.toString();
    return tokensList.join(":");
}

function getMinutesFromTime(timeStr: string) {
    const tokensList = timeStr.split(":");
    return parseInt(tokensList[1]);
}

function setMinutesToTime(timeStr: string, minutes: number){
    const tokensList = timeStr.split(":");
    tokensList[1] = minutes < 10? `0${minutes}` : minutes.toString();
    return tokensList.join(":");
}

// function subtractTime(timeStr1: string, timeStr2: string) {
//     const time1 = new Date();
//     time1.setHours(getHoursFromTime(timeStr1), getMinutesFromTime(timeStr1), 0, 0);
//     console.log(time1);

//     const time2 = new Date();
//     time1.setHours(getHoursFromTime(timeStr2), getMinutesFromTime(timeStr2), 0, 0);
//     console.log(time2);
// }

export { db, connection, getTimeFromDate, getMinutesFromTime, setMinutesToTime, getHoursFromTime, setHoursToTime };

// await db.insert(schemas.CoinMarketCapSchema).values({ crypto_symbol: "BTC", last_updated: getTimeFromDate(new Date()) });
// const result = await db.select().from(schemas.CoinMarketCapSchema);
// console.log(setMinutesToTime(getTimeFromDate(new Date()), 24));
// const list = await db.selectDistinct({ last_updated: schemas.CoinMarketCapSchema.last_updated }).from(schemas.CoinMarketCapSchema);
// console.log(list.length);
// process.exit(0);


