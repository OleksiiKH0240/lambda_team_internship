import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';


dotenv.config();


function getCryptoCurrencyDetails(key: string = "slug", firstN: Number = 100) {
    const cryptoData = fs.readFileSync("crypto.json", "utf8");
    const cryptoNamesList: any[] = JSON.parse(cryptoData).slice(0, firstN).map(
        (value: { [x: string]: any }) => key == "all" ? value : value[key]);
    return cryptoNamesList;
}


const CoinMarketCap_ApiKey = process.env["CoinMarketCap_ApiKey"];
const CoinMarketCap_BaseUrl = "https://pro-api.coinmarketcap.com";


async function downloadCryptoCurrencyDetails() {
    const limit = 3000;
    const CoinMarketCap_Url = CoinMarketCap_BaseUrl + `/v1/cryptocurrency/listings/latest?start=1&limit=${limit}&sort=market_cap&cryptocurrency_type=coins&tag=all`;

    const requestConfig = {
        "method": "get",
        "url": CoinMarketCap_Url,
        "headers": {
            "X-CMC_PRO_API_KEY": CoinMarketCap_ApiKey,
            "Accept": "*/*"
        }
    };

    const response = await axios.request(requestConfig);
    const error_code = response.data["status"]["error_code"];
    const rawData = response.data["data"];

    const cryptoCurrList: object[] = [];
    let data: { [x: string]: any; }[] = Object.values(rawData);
    console.log(`number of samples to filter: ${data.length}`);

    const forbidStr = "LUNA,WAVES,AKT,ICX,SC,SXP,ONE,USTC,FLUX,MOB,TNC,XRD," +
        "TREX,DFI,DEL,ARK,RBTC,XNO,PEG,STEEM,NTR,TRX,NEO,CFX,LUNC,CSPR,XCH," +
        "BTG,MED,BTM,NTRN,ERG,EWT,SCRT,CTK,TT,GRS,CCD,ACA,META,WAN,CTC,DAG," +
        "LAT,IRIS,BTS,AHT,LTO,REI,BSV,MIOTA,HIVE,WAXP,TOMO,FNSA,RON,DESO,CORE," +
        "RAD,ARDR,XVG,DNX,ETN,DERO,VRSC,ARRR,SBD,PHB,CTXC,FIRO,NULS,CET,CENNZ," +
        "BITCI,PIVX,FIO,VITE,DMD,ZANO,RXD,BCD,EPIC,NEXA,QRL,AMO,LBC,VAL,HNS,GBYTE," +
        "AE,XCP,NYE,ZNN,HC,PCX,POLIS,LYRA,IQ,EVMOS,SPACE,MIM,PLEX,MIM,PLEX,JUNO," +
        "KUB,KUJI,XBT,OCTA,XDAG,SBTC,IUS,KOIN,KAU,KAG,CSC,XKI,GXC,HDX,RDD,CHESS," +
        "UMI,SNT,KAI,VLX,TARA,FRA,AMB,HTR,HYDRA,APL,TENET,VOLT";
    const forbidSet = new Set(forbidStr.split(","));

    const CoinStats_Url = "https://api.coinstats.app/public/v1/coins?limit=2000&currency=USD";
    const coinStatsResponse = await axios.request({
        "method": "get", "url": CoinStats_Url
    });
    const coinStatsData: { [x: string]: any; }[] = coinStatsResponse.data["coins"];
    let coinStatsIdx = -1;

    const Coinpaprika_Url = "https://api.coinpaprika.com/v1/coins";
    const coinpaprikaResponse = await axios.request({
        "method": "get", "url": Coinpaprika_Url
    });
    const coinpaprikaData: { [x: string]: any; }[] = coinpaprikaResponse.data;
    let coinpaprikaIdx = -1;

    for (let obj of data) {
        if (!forbidSet.has(obj["symbol"])) {
            coinStatsIdx = coinStatsData.findIndex(cs_obj => cs_obj["symbol"] == obj["symbol"]);
            coinpaprikaIdx = coinpaprikaData.findIndex(cp_obj => cp_obj["symbol"] == obj["symbol"]);
            if (coinStatsIdx != -1 && coinpaprikaIdx != -1) {
                cryptoCurrList.push({
                    "id": obj["id"],
                    "name": obj["name"],
                    "symbol": obj["symbol"],
                    "slug": obj["slug"],
                    "coinstats_id": coinStatsData[coinStatsIdx]["id"],
                    "coinpaprika_id": coinpaprikaData[coinpaprikaIdx]["id"]
                });
            }
        }

    }

    console.log(cryptoCurrList.length);
    fs.writeFile('crypto.json', JSON.stringify(cryptoCurrList,), { flag: 'w' }, err => { });
}



// CoinMarketCap -----------------------------------------

// Promise<{ [index: string]: ({ [index: string]: any; }[] & string) }>
async function getCoinMarketCapRate(): Promise<any> {
    const cryptoSlugsList = getCryptoCurrencyDetails("slug");
    // console.log(cryptoSlugsList);

    const CoinMarketCap_Url = CoinMarketCap_BaseUrl + `/v2/cryptocurrency/quotes/latest?slug=${cryptoSlugsList.join(",")}`;

    // console.log(CoinMarketCap_Url);

    const requestConfig = {
        "method": "get",
        "url": CoinMarketCap_Url,
        "headers": {
            "X-CMC_PRO_API_KEY": CoinMarketCap_ApiKey,
            "Accept": "*/*"
        }
    };

    const response = await axios.request(requestConfig);
    const error_code = response.data["status"]["error_code"];
    const rawData = response.data["data"];

    let data: { [x: string]: any; }[] = Object.values(rawData);
    data = data.map((obj: { [x: string]: any; }) => {
        return {
            // "id": obj["id"],
            // "name": obj["name"],
            "symbol": obj["symbol"],
            // "slug": obj["slug"],
            "usd_price": obj["quote"]["USD"]["price"],
            "last_updated": obj["quote"]["USD"]["last_updated"]
        };
    })

    console.log(`error_code: ${error_code}`);
    console.log(`samples number: ${data.length}`);
    console.log("crypto currency rates was downloaded from CoinMarketCap.")


    return { "market": "CoinMarketCap", "data": data }
}



// CoinBase -----------------------------------------
const CoinBase_BaseUrl = "https://api.coinbase.com";

// Promise<{ [index: string]: ({ [index: string]: any; }[] & string) }>
async function getCoinBaseRate(): Promise<any> {
    const cryptoSymbolsList = getCryptoCurrencyDetails("symbol");
    // console.log(cryptoSymbolsList);

    let requestConfig, CoinBase_Url;
    const data: object[] = [];

    for (let symbol of cryptoSymbolsList) {
        CoinBase_Url = CoinBase_BaseUrl + `/v2/exchange-rates?currency=${symbol}`;
        requestConfig = {
            "method": "get",
            "url": CoinBase_Url,
        };

        const response = await axios.request(requestConfig);
        // console.log(response.data)
        const usd_price = response.data["data"]["rates"]["USD"]

        if (usd_price == undefined) {
            process.stdout.write(symbol + ",");
        }

        const dateStr = new Date().toLocaleString("en-US", {
            hourCycle: 'h23',
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });


        data.push({
            "symbol": symbol,
            "usd_price": usd_price,
            "last_updated": new Date(Date.parse(dateStr))
        })
    }

    console.log(`samples number: ${data.length}`);
    console.log("crypto currency rates was downloaded from CoinBase.")

    return { "market": "CoinBase", "data": data };
}



// CoinStats -----------------------------------------
const CoinStats_BaseUrl = "https://api.coinstats.app";

// Promise<{ [index: string]: ({ [index: string]: any; }[] & string) }>
async function getCoinStatsRate(): Promise<any> {
    const cryptoIdsList = getCryptoCurrencyDetails("coinstats_id");
    const cryptoSymbolsList = getCryptoCurrencyDetails("symbol");

    // console.log(cryptoSlugsList);

    let requestConfig, CoinStats_Url;
    const data: object[] = [];

    for (let coinstats_id of cryptoIdsList) {
        CoinStats_Url = CoinStats_BaseUrl + `/public/v1/coins/${coinstats_id}?currency=USD`;
        requestConfig = {
            "method": "get",
            "url": CoinStats_Url,
        };

        const response = await axios.request(requestConfig);
        // console.log(response.data)
        const usd_price = response.data["coin"]["price"];

        if (usd_price == undefined) {
            process.stdout.write(coinstats_id + ",");
        }

        const dateStr = new Date().toLocaleString("en-US", {
            hourCycle: 'h23',
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit"
        });

        const symbolIdx = cryptoIdsList.findIndex((value) => value == coinstats_id);
        data.push({
            "symbol": cryptoSymbolsList.at(symbolIdx),
            "usd_price": usd_price,
            "last_updated": new Date(Date.parse(dateStr))
        })
    }

    console.log(`samples number: ${data.length}`);
    console.log("crypto currency rates was downloaded from CoinStats.")

    return { "market": "CoinStats", "data": data };
}



// Kucoin -----------------------------------------
const Kucoin_BaseUrl = "https://api.kucoin.com";

// Promise<{ [index: string]: ({ [index: string]: any; }[] & string) }>
async function getKucoinRate(): Promise<any> {
    const cryptoSymbolsList = getCryptoCurrencyDetails("symbol");

    const Kucoin_Url = Kucoin_BaseUrl + `/api/v1/prices?base=USD&currencies=${cryptoSymbolsList.join(",")}`;

    // console.log(CoinMarketCap_Url);

    const requestConfig = {
        "method": "get",
        "url": Kucoin_Url
    };

    const response = await axios.request(requestConfig);
    const rawData = response.data["data"];

    const data: { [x: string]: any; }[] = [];

    const dateStr = new Date().toLocaleString("en-US", {
        hourCycle: 'h23',
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });

    let usd_price;
    for (let symbol of cryptoSymbolsList) {
        usd_price = rawData[symbol];
        if (usd_price == undefined) process.stdout.write(symbol + ",");

        data.push({
            "symbol": symbol,
            "usd_price": usd_price,
            "last_updated": new Date(Date.parse(dateStr))
        });
    }

    console.log(`samples number: ${data.length}`);
    console.log("crypto currency rates was downloaded from Kucoin.")

    return { "market": "Kucoin", "data": data };
}



// Coinpaprika -----------------------------------------
const Coinpaprika_BaseUrl = "https://api.coinpaprika.com/v1";

async function getCoinpaprikaRate() {
    const cryptoIdsList = getCryptoCurrencyDetails("coinpaprika_id");
    const cryptoSymbolsList = getCryptoCurrencyDetails("symbol");

    // console.log(cryptoSlugsList);

    let requestConfig, Coinpaprika_Url;
    const data: object[] = [];

    for (let coinpaprika_id of cryptoIdsList) {
        Coinpaprika_Url = Coinpaprika_BaseUrl + `/price-converter?base_currency_id=${coinpaprika_id}&quote_currency_id=usd-us-dollars&amount=1`;
        requestConfig = {
            "method": "get",
            "url": Coinpaprika_Url,
        };

        const response = await axios.request(requestConfig);


        // console.log(response.data)
        const usd_price = response.data["price"];

        if (usd_price == undefined) {
            process.stdout.write(coinpaprika_id + ",");
        }

        const symbolIdx = cryptoIdsList.findIndex((value) => value == coinpaprika_id);
        data.push({
            "symbol": cryptoSymbolsList.at(symbolIdx),
            "usd_price": usd_price,
            "last_updated": response.data["base_price_last_updated"]
        })
    }

    console.log("crypto currency rates was downloaded from Coinpaprika.")
    console.log(`samples number: ${data.length}`);

    return { "market": "Coinpaprika", "data": data };
}

export { getCoinMarketCapRate, getCoinBaseRate, getCoinStatsRate, getKucoinRate, getCryptoCurrencyDetails };

// console.log(await getCoinMarketCapRate());
// console.log(await getCoinBaseRate());
// console.log(await getCoinStatsRate());
// console.log(await getKucoinRate());
// console.log(await getCoinpaprikaRate());

// await downloadCryptoCurrencyDetails();



// let l = await getCoinMarketCapRate();
// let l1: { [x: string]: any; }[] = Object.values(l.data)
// let s = new Set(l1.map(value => value["symbol"]));
// console.log(s.size);