function points(string) {
    const resultArr = [];
    let n = 2 ** (string.length - 1);
    let strEl;
    for (let i = 0; i < n; i++){
        let dotsPlaces = i.toString(2);
        dotsPlaces = "0".repeat(string.length - 1 - dotsPlaces.length) + dotsPlaces
        strEl = string[0]
        for (let j = 0; j < dotsPlaces.length; j++){
            strEl = strEl + dotsPlaces[j]
            strEl = strEl + string[j + 1]
        }
        strEl = strEl.replaceAll("0", "")
        strEl = strEl.replaceAll("1", ".")
        resultArr.push(strEl)
    }
    return resultArr;
}

console.log(points("abc"))
