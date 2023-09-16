import fs from 'fs';


function longToIp(ipNumber) {

    return ((ipNumber >> 24) & 0xFF) +
        "." + ((ipNumber >> 16) & 0xFF) +
        "." + ((ipNumber >> 8) & 0xFF) +
        "." + (ipNumber & 0xFF);

}

function ipToLong(ip) {
    // ip should be a string
    const ipArray = ip.split(".");
    let result = 0;
    let power;
    for (let i = 0; i < ipArray.length; i++) {
        power = 3 - i;
        result += (Math.pow(256, power) * parseInt(ipArray[i]));
    }
    return result;
}


// find first element which is lower than wanted element
function binarySearch(array, x) {

    let lower = 0, upper = array.length - 1, mid;
    // console.log(x);
    // console.log(array);

    while (lower <= upper) {
        mid = Math.floor(lower + (upper - lower) / 2);
        // console.log(`lower: ${lower}, upper: ${upper}, mid: ${mid}`);

        if (array[mid] == x) return mid;
        else if (array[mid] < x)
            lower = mid + 1;
        else
            upper = mid - 1;
    }

    return lower - 1;
}


export function getInfoByIp(ip) {
    const ipv4Regexp = /^(\d{1,3}\.){3}\d{1,3}/;
    const ipv6PrefixRegexp = /(.{0,4}:){3}/;

    if (typeof ip == 'string' && ip.includes(".") && ip.match(ipv4Regexp) != null) ip = ipToLong(ip);
    else if (ip.includes(".") && ip.match(ipv6PrefixRegexp) != null) ip = ipToLong(ip.replace(ipv6PrefixRegexp, ""));
    else if (typeof ip == 'string') ip = parseInt(ip);

    console.log(ip);


    const rowData = fs.readFileSync("IP2LOCATION-LITE-DB1.CSV", "utf8");
    const data = rowData.split("\r\n").map(line => line.split(","));

    // deleting empty string
    data.pop()

    const keysColumn = data.map(subArr => parseInt(subArr[0].replaceAll('"', '')));
    const idx = binarySearch(keysColumn, ip), requiredData = data[idx].map(str => str.replaceAll('"', ''));
    // console.log(`idx: ${idx}`);
    // console.log(requiredData);
    // console.log(longToIp(requiredData[0]));

    return {
        beginIP: longToIp(parseInt(requiredData[0])),
        endIP: longToIp(parseInt(requiredData[1])),
        countryCode: requiredData[2],
        countryFullName: requiredData[3]
    };
    // console.log(data.at(0));
    // console.log(data.at(-1));

}

// const ips = [
//     "45.232.208.143",
//     "185.182.120.34",
//     "45.177.176.23",
//     "5.44.80.51",
//     "91.149.48.22",
//     "83.229.33.3",
//     "203.24.108.65",
//     "23.43.23.15",
//     "89.28.176.5",
//     "77.83.248.211"
// ]

// for (let ip of ips) {
//     console.log(ip);
//     console.log(getInfoByIp(ip));
// }

// console.log(getInfoByIp("3642015746"));
// console.log(getInfoByIp(ips[0]));

// const ip = longToIp(3642015744);
// console.log(ip);
// const ip = "3642015746";
// const ipNumb = ipToLong(ip);
// console.log(ipNumb);

