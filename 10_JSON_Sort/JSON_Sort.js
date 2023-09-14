import axios from 'axios';
import https from 'https';

const endpoints = [
    "https://jsonbase.com/lambdajson_type1/793",
    "https://jsonbase.com/lambdajson_type1/955",
    "https://jsonbase.com/lambdajson_type1/231",
    "https://jsonbase.com/lambdajson_type1/931",
    "https://jsonbase.com/lambdajson_type1/93",
    "https://jsonbase.com/lambdajson_type2/342",
    "https://jsonbase.com/lambdajson_type2/770",
    "https://jsonbase.com/lambdajson_type2/%770",
    "https://jsonbase.com/lambdajson_type2/491",
    "https://jsonbase.com/lambdajson_type2/281",
    "https://jsonbase.com/lambdajson_type2/718",
    "https://jsonbase.com/lambdajson_type3/310",
    "https://jsonbase.com/lambdajson_type3/806",
    "https://jsonbase.com/lambdajson_type3/469",
    "https://jsonbase.com/lambdajson_type3/258",
    "https://jsonbase.com/lambdajson_type3/516",
    "https://jsonbase.com/lambdajson_type4/79",
    "https://jsonbase.com/lambdajson_type4/706",
    "https://jsonbase.com/lambdajson_type4/521",
    "https://jsonbase.com/lambdajson_type4/350",
    "https://jsonbase.com/lambdajson_type4/64",
    "https://jsonbase.com/lambdajson_type4/%64",
];

const agent = new https.Agent({
    rejectUnauthorized: false
});

async function getInfo(endpoint) {
    let response = {}, attemps = 0;
    while (response.status != 200 && attemps < 3) {
        try {
            response = await axios.request({
                method: "get",
                url: endpoint,
                httpsAgent: agent
            });
        } catch (error) {
            attemps++;
        }
    }

    if (response.status != 200) {
        throw new DeadEndpoint(`after ${attemps} attemps still can't reach endpoint: ${endpoint}`);
    }

    // console.log(response.data);

    // BFS
    const data = response.data, keys = Object.keys(data), targetKey = "isDone";
    let currKey, currVal, currScope, currKeys;
    const keyScopeMap = {};
    for (let key of keys) { keyScopeMap[key] = data; }

    while (keys.length != 0) {
        currKey = keys.shift();
        currScope = keyScopeMap[currKey];
        currVal = currScope[currKey];
        if (currKey == targetKey) {
            const res = {};
            res[currKey] = currVal;
            return res;
        }

        if (typeof currVal == 'object') {
            currKeys = Object.keys(currVal);
            keys.push(...currKeys);

            for (let key of currKeys) { keyScopeMap[key] = currVal; }
        }
        // console.log(keys);
    }

}

class DeadEndpoint extends Error {
    constructor(message) {
        super(message);
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
    }
}

let res, isDoneTrueCount = 0, isDoneFalseCount = 0;
for (let endpoint of endpoints) {
    try {
        res = await getInfo(endpoint);
        res.isDone == true ? isDoneTrueCount++ : isDoneFalseCount++;
        console.log(`${endpoint}: ${JSON.stringify(res)}`,);
    } catch (error) {
        console.log(error);
    }
}
console.log(`True values: ${isDoneTrueCount}`);
console.log(`False values: ${isDoneFalseCount}`);
