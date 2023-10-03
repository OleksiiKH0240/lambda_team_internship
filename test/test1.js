let a = [1, 2, 3];
let b = [1, 2, 3];
let o = new Map();
o.set("a", 4);
o.set("a", 5);
// console.log(o.get("a"));
let obj = { a: 1, b: 4 };

const dateStr = new Date().toLocaleString("en-US", {
    hourCycle: "h23",
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
});

const testTime = new Date(Date.parse(dateStr));
console.log(new Date(Math.round(testTime / 60000) * 60000));
console.log(5 % 60);

// console.log(a.find(value => value == 4));
// console.log("a" && "ab".split(" ")[1])