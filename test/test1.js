let a = [1, 2, 3];
let o = new Map();
o.set("a", 4);
o.set("a", 5);
console.log(o.get("a"));
// console.log(a.find(value => value == 4));
// console.log("a" && "ab".split(" ")[1])