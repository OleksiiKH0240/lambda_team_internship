import express from 'express';
import dotenv from 'dotenv';
import { getCoinMarketCapRate, getCoinBaseRate, getCoinStatsRate, getKucoinRate, getCryptoCurrencyDetails } from "./Crypto_Markets_API";
import * as schemas from "./schemas";
import { db, getTimeFromDate, getMinutesFromTime, setMinutesToTime, setHoursToTime, getHoursFromTime } from "./database";
import { eq, and, between } from 'drizzle-orm';


const app = express();

app.use(express.json());

// dotenv.config();
app.get("/", async (req, res) => {
    const cryptoCurrencySymbol = req.body.crypto_currency_symbol;
    const market = req.body.market;
    const lastUpdatedPeriod = req.body.last_updated_period;

    console.log(cryptoCurrencySymbol, market, lastUpdatedPeriod);
    const response = await getCryptoCurrencyRate(cryptoCurrencySymbol, market, lastUpdatedPeriod);
    res.status(200).json(response);
})

app.listen(80, () => {
    console.log("app is listening on 80 port.")
})



// -----------------------------------------------------------------
const cryptoSymbolsSet = new Set(getCryptoCurrencyDetails("symbol"))

const marketsObjs: { [x: string]: any } = {
    "CoinMarketCap": {
        "func": getCoinMarketCapRate,
        "schema": schemas.CoinMarketCapSchema,
        "lastData": {}
    },
    "CoinBase": {
        "func": getCoinBaseRate,
        "schema": schemas.CoinBaseSchema
    },
    "CoinStats": {
        "func": getCoinStatsRate,
        "schema": schemas.CoinStatsSchema
    },
    "Kucoin": {
        "func": getKucoinRate,
        "schema": schemas.KucoinSchema
    }
};


let updateMode = false;
// time in miliseconds (5 minutes)
const timeStep = 300000;
// const timeStep = 60000;

// time in miliseconds (24 hours)
const maxObservationPeriod = 86400000;
// const maxObservationPeriod = 300000;


// gets data from database
async function getCryptoCurrencyRate(cryptoCurrencySymbol: string = "BTC", market: string = "all", lastUpdatedPeriod: string = "15mins") {
    if (!cryptoSymbolsSet.has(cryptoCurrencySymbol)) {
        return { error: "wrong crypto currency symbol" };
    }

    let markets = [];
    if (market != "all") {
        if (Object.keys(marketsObjs).findIndex((marketName) => marketName == market) == -1) {
            return { error: "wrong crypto market" };
        }
        markets = [marketsObjs[market],]
    }
    else {
        markets = Object.values(marketsObjs);
    }

    let timeMultiplier: any;
    switch (lastUpdatedPeriod) {
        case "15mins":
            timeMultiplier = 3;
            break;
        case "1hour":
            timeMultiplier = 12;
            break;
        case "4hours":
            timeMultiplier = 48;
            break;
        case "24hours":
            timeMultiplier = -1;
            break;
        default:
            return { error: "invalid last updated period" };
    }


    let resultPrice = 0;
    for (const marketObj of markets) {
        const now = Date.now();
        const lowerTimeBound = getTimeFromDate(new Date(now - timeMultiplier * timeStep));
        const upperTimeBound = getTimeFromDate(new Date(now - (timeMultiplier * timeStep) + timeStep));

        let candidatesList;
        if ((getHoursFromTime(upperTimeBound) - getHoursFromTime(lowerTimeBound)) < 0) {
            candidatesList = await db.select().from(marketObj.schema).
                where(
                    and(
                        eq(marketObj.schema.crypto_symbol, cryptoCurrencySymbol),
                        between(marketObj.schema.last_updated, lowerTimeBound, "23:59"))).
                orderBy(marketObj.schema.last_updated);

            const candidatesList2 = await db.select().from(marketObj.schema).
                where(
                    and(
                        eq(marketObj.schema.crypto_symbol, cryptoCurrencySymbol),
                        between(marketObj.schema.last_updated, "00:00", upperTimeBound))).
                orderBy(marketObj.schema.last_updated);

            candidatesList.push(...candidatesList2)
        }
        else {
            candidatesList = await db.select().from(marketObj.schema).
                where(
                    and(
                        eq(marketObj.schema.crypto_symbol, cryptoCurrencySymbol),
                        between(marketObj.schema.last_updated, lowerTimeBound, upperTimeBound))).
                orderBy(marketObj.schema.last_updated);
        }


        console.log(`lowerTimeBound: ${lowerTimeBound}, upperTimeBound: ${upperTimeBound}, candidatesList: ${candidatesList.map((value) => value.price).join(", ")}`);


        if (candidatesList.length == 0) {
            return "time period was not recorded";
        }

        resultPrice += candidatesList[0].price;

    }
    resultPrice = resultPrice / markets.length;

    return {
        "market": market,
        "crypto_symbol": cryptoCurrencySymbol,
        "last_updated_period": lastUpdatedPeriod,
        "price": resultPrice
    }
}


async function updateCryptoCurrencyData(testFunc: (() => any) | undefined = undefined, testTime: any | undefined = undefined) {
    const marketSchema = marketsObjs.CoinMarketCap.schema;
    const list = await db.selectDistinct({ last_updated: marketSchema.last_updated }).from(marketSchema);

    if (list.length >= Math.floor(maxObservationPeriod / timeStep)) updateMode = true;

    console.log("database is updating...");

    let dateStr, now: any, cryptoData: { [index: string]: any }[];

    for (const marketObj of Object.values(marketsObjs)) {
        while (true) {
            try {
                if (testTime == undefined) {
                    dateStr = new Date().toLocaleString("en-US", {
                        hourCycle: 'h23',
                        day: "2-digit", month: "2-digit", year: "numeric",
                        hour: "2-digit", minute: "2-digit"
                    });
                    now = getTimeFromDate(new Date(Date.parse(dateStr)));
                    // console.log(`now: ${now}`);
                }
                else {
                    now = getTimeFromDate(testTime);
                }


                if (testFunc == undefined) {
                    cryptoData = (await marketObj.func()).data;
                }
                else {
                    cryptoData = testFunc().data;
                }

                break;
            } catch (error) {
                console.log("error occured durring uploading data from market");
                // console.log(error);
            }
        }

        for (const cryptoCurr of cryptoData) {
            if (!updateMode) {
                await db.insert(marketObj.schema).values({
                    crypto_symbol: cryptoCurr.symbol,
                    price: cryptoCurr.usd_price,
                    last_updated: now
                });
            }
            else {
                // console.log(`now: ${now}`);
                let candidatesList = await db.select().from(marketObj.schema).where(
                    and(
                        eq(marketObj.schema.crypto_symbol, cryptoCurr.symbol),
                        eq(marketObj.schema.last_updated, now)));
                // if (candidatesList.length == 1) all is ok
                let candidateTime;

                if (cryptoCurr.symbol == "BTC") {
                    console.log(`now: ${now}, candidatesList: ${candidatesList.join(", ")}`);
                }

                if (candidatesList.length == 1) candidateTime = now;
                else if (candidatesList.length == 0) {
                    let minutes = getMinutesFromTime(now);
                    minutes = Math.floor(minutes / 10) * 10;

                    const lowerTimeBound = setMinutesToTime(now, minutes);
                    let upperTimeBound = setMinutesToTime(now, (minutes + 20) % 60);

                    if (minutes + 20 >= 60) upperTimeBound = setHoursToTime(upperTimeBound, (getHoursFromTime(now) + 1) % 24)
                    if (upperTimeBound == "00:00") upperTimeBound = "23:59";

                    if (cryptoCurr.symbol == "BTC") {
                        console.log(`lowerTimeBound: ${lowerTimeBound}, upperTimeBound: ${upperTimeBound}`);
                    }

                    if ((getHoursFromTime(upperTimeBound) - getHoursFromTime(lowerTimeBound)) < 0) {
                        candidatesList = await db.select().from(marketObj.schema).
                            where(
                                and(
                                    eq(marketObj.schema.crypto_symbol, cryptoCurr.symbol),
                                    between(marketObj.schema.last_updated, lowerTimeBound, "23:59"))).
                            orderBy(marketObj.schema.last_updated);

                        const candidatesList2 = await db.select().from(marketObj.schema).
                            where(
                                and(
                                    eq(marketObj.schema.crypto_symbol, cryptoCurr.symbol),
                                    between(marketObj.schema.last_updated, "00:00", upperTimeBound))).
                            orderBy(marketObj.schema.last_updated);

                        candidatesList.push(...candidatesList2)
                    }
                    else {
                        candidatesList = await db.select().from(marketObj.schema).
                            where(
                                and(
                                    eq(marketObj.schema.crypto_symbol, cryptoCurr.symbol),
                                    between(marketObj.schema.last_updated, lowerTimeBound, upperTimeBound))).
                            orderBy(marketObj.schema.last_updated);
                    }


                    if (cryptoCurr.symbol == "BTC") {
                        console.log(`candidatesList: ${candidatesList.map((value) => value.last_updated).join(", ")}`);
                    }

                    candidatesList = candidatesList.filter((candidate) => {
                        const timeEl: any = candidate.last_updated;
                        if ((getHoursFromTime(timeEl) - getHoursFromTime(now)) < 0) return timeEl < now;

                        return timeEl > now;
                    })

                    if (cryptoCurr.symbol == "BTC") {
                        console.log(`filtered candidatesList: ${candidatesList.map((value) => value.last_updated).join(", ")}`);
                    }

                    candidateTime = candidatesList[0].last_updated;

                    if (cryptoCurr.symbol == "BTC") {
                        console.log(`chosenTime: ${candidateTime}`);
                        console.log();
                    }
                }

                await db.update(marketObj.schema).set({ price: cryptoCurr.usd_price, last_updated: now }).
                    where(
                        and(eq(marketObj.schema.crypto_symbol, cryptoCurr.symbol),
                            eq(marketObj.schema.last_updated, candidateTime)));
                
            }

        }
    }
    console.log("database was updated\n");
}

const loop = setInterval(updateCryptoCurrencyData, timeStep)

// clearInterval(loop);


const testFunc = () => {
    let strs = getCryptoCurrencyDetails("symbol");
    let dataEl: any;
    const data = [];
    for (const str of strs) {
        dataEl = {};
        dataEl["symbol"] = str;
        dataEl["usd_price"] = Math.random() * 1000;
        dataEl["last_update"] = new Date();
        data.push(dataEl);
    }
    const testData: any = {};
    testData["market"] = "test_market";
    testData["data"] = data;

    return testData;
};

// console.log(testFunc());

async function updateCryptoCurrencyDataTest(stepsNumber: number = 288) {
    console.log("test database is updating...");

    const delta = stepsNumber == 288 ? maxObservationPeriod : 0;
    const dateStr = new Date(Date.now() - delta).toLocaleString("en-US", {
        hourCycle: "h23",
        day: '2-digit',
        hour: "2-digit", minute: "2-digit"
    });
    let testTime = Date.parse(dateStr);

    for (let i = 0; i < stepsNumber; i++) {
        updateCryptoCurrencyData(testFunc, new Date(testTime));
        testTime += timeStep;
    }

    console.log("test database was updated\n");
}

// await updateCryptoCurrencyDataTest();

// console.log(await getCryptoCurrencyRate("BTC", "CoinMarketCap", "1hour"));

// console.log((getHoursFromTime("00:10") - getHoursFromTime("23:50")) < 0);

// connection.destroy();
