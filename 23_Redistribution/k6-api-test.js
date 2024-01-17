import { check } from 'k6';
import http from 'k6/http';


// define configuration
export const options = {
    // define thresholds
    thresholds: {
        // http_req_failed: [{ threshold: 'rate<0.01', abortOnFail: true }], // http errors should be less than 1%
        http_req_duration: ['p(99)<3000'], // 99% of requests should be below 3s
    },
    'summaryTrendStats': ['min', 'med', 'avg', 'p(90)', 'p(95)', 'max', 'count'],
    stages: [

        { duration: '0', target: 300 },

        { duration: '1s', target: 300 },

    ],
};

export default function () {
    // define URL and request body
    const url = "http://redist-LoadB-ouTfYxrMSdKu-1823352955.us-east-1.elb.amazonaws.com";
    // const url = "http://demo-alb-1592333161.us-east-1.elb.amazonaws.com";
    // const url = "https://6urz5lilsb.execute-api.us-east-1.amazonaws.com/default/demo-lambda";

    const maxShopIdx = 6;
    const minShopIdx = 1;
    const shopIdx = Math.floor(minShopIdx + (Math.random() * maxShopIdx))

    const body = JSON.stringify({
        username: 'test_case',
        password: '1234',
        searchPhrase: "sdy",
        shopId: `shop${shopIdx}`
    });
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // send a get request and save response as a variable
    const res = http.request("GET", url, body, params);
    // console.log(res.status);
    // const message = JSON.parse(res.body)?.message;
    // if (Math.floor(res.status / 100) == 5) {
    //     console.log(res);
    // }

    const parsedRes = {
        status: res.status,
        // message
    };

    check(parsedRes, {
        "status:2xx": (res) => (Math.floor(res.status / 100) == 2),
        "status:200": (res) => (res.status == 200),
        "status:204": (res) => (res.status == 204),
        "status:4xx": (res) => (Math.floor(res.status / 100) == 4),
        "status:402, Shop limit exceeded": (res) => (res.status == 402),
        "status:404": (res) => (res.status == 404),
        "status:5xx": (res) => (Math.floor(res.status / 100) == 5),
        "status:502": (res) => (res.status == 502),
        "status:503, Lambda limit exceeded": (res) => (res.status == 503),
        "status:429, Too many requests exception":
            (res) => (res.status == 429),
        "response code was (200 and message was 'user is approved.') or(400 and message was 'user is rejected.')":
            (res) => (res.status == 200 ) || (res.status == 400 )
    });
}