let a = 2.78;
let b = [1, 2, 3];
let o = new Map();
o.set("a", 4);
o.set("a", 5);
// console.log(o.get("a"));
let obj = { a: 1, b: 4, c: 5, d: 5 };

const dateStr = new Date().toLocaleString("en-US", {
    hourCycle: "h23",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
});

const testTime = new Date(Date.parse(dateStr));
// console.log(new Date(Math.round(testTime / 60000) * 60000));
// console.log(typeof a);

Object.defineProperty(Array.prototype, "multiply",
    {
        value: function (multiplier = 10) { return this.map((val) => val * multiplier) }
    })

// Array.prototype.multiply = function (multiplier: number = 10) { return this.map((val: number) => val * multiplier) };

const c = [false, true];

const filtered = Object.entries(obj).filter(([key, value]) => ["a", "c"].includes(key));
const filteredObj = Object.fromEntries(filtered);

console.log({a});

// console.log(a.find(value => value == 4));
// console.log("a" && "ab".split(" ")[1])

try {
    throw new SyntaxError();
}
catch (e) {
    if (e instanceof TypeError){
        console.log("type error");
    } 
    if (e instanceof SyntaxError) {
        console.log("error");
    }
    // console.log(e);
}
let a1;
a1 =  {"a1": 1, "b": 2}
const l = []
// l.push(...[4,5,6])
a1["c"] = 5;

const d = Object.fromEntries(l, )

console.log(l.lenght)




