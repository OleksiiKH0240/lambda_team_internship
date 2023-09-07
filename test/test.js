const state = { start: 1, "orange": 2, 1: 4 };
const previousStateMap = { "currency": "start", city: "start", "frequency": "city" }


// console.log(1 in state);
// const s = previousStateMap.city;
// const s =  "hello" || process.env.botUrl;
const s = [
    {
        "currencyCodeA": 840,
        "currencyCodeB": 980,
        "date": 1694034073,
        "rateBuy": 36.65,
        "rateCross": 0,
        "rateSell": 37.4406
    },
    {
        "currencyCodeA": 978,
        "currencyCodeB": 980,
        "date": 1694034073,
        "rateBuy": 39.3,
        "rateCross": 0,
        "rateSell": 40.6504
    }
];

console.log(s.filter(
    (currRate) => currRate["currencyCodeA"] == 840 && currRate["currencyCodeB"] == 980));
