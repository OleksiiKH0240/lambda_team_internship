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

console.log({ a });

// console.log(a.find(value => value == 4));
// console.log("a" && "ab".split(" ")[1])

try {
    throw new SyntaxError();
}
catch (e) {
    if (e instanceof TypeError) {
        console.log("type error");
    }
    if (e instanceof SyntaxError) {
        console.log("error");
    }
    // console.log(e);
}
let a1;
a1 = { "a1": 1, "b": 2 }
const l = []
// l.push(...[4,5,6])
a1["c"] = 5;

const d = Object.fromEntries(l,)

const { VSCODE_PID1 } = process.env || { VSCODE_PID1: 80 };

const shopIds = [1, 2, 3, 4, 5];

for (const i of shopIds) {
    console.log(i);
}

// import jimp from "jimp";
import jimp from "jimp-native";
import sharp from "sharp";
import fs from "fs/promises";

const svg = `<svg
        xmlns="http://www.w3.org/2000/svg" 
        xml:lang="en"
        height="1080"
        width="1920">
        <text
        font-style="italic"
        x="490" y="550" font-size="200" fill="#454545">
        Photo Drop
        </text>
        </svg>`;
    
await sharp(Buffer.from(svg)).toFile("./test/watermark.png");

const watermark = sharp("./test/PhotoDrop Logo.png");
console.log(await watermark.metadata())

const photoBuffer = await fs.readFile("./test/daniel-bernard-2T1lWf9h3zk-unsplash 1.png")

// const photo = await jimp.read("./test/testPhoto1.jpeg");
// const photo = await jimp.read(photoBuffer);
const photo = sharp(photoBuffer);
const { width: photoW, height: photoH } = await photo.metadata();
console.log(photoW, photoH);
// const [photoW, photoH] = [photo.getWidth(), photo.getHeight()];
const resizedWatermark = watermark.resize(
    Math.floor(photoW/2.442043), 
    Math.floor(photoH/3.23529), 
    {
        fit: "inside"
    });
console.log(await resizedWatermark.metadata())
await resizedWatermark.toFile("./test/resizedWatermark.png");
const [leftPadding, topPadding] = [Math.floor(photoW/3.377717), Math.floor(photoH/2.65273)];
console.log(leftPadding, topPadding);
console.time("1");
const wPhoto = await photo.
                composite([{
                    input: await resizedWatermark.toBuffer(),
                    gravity: "center",
                    left: leftPadding,
                    top: topPadding
                }]).toBuffer();
// const wPhoto =  photo.composite(watermark.resize(photoW, photoH), 0, 0, {
//     mode: jimp.BLEND_SOURCE_OVER,
//     opacityDest: 1,
//     opacitySource: 1
// });
console.timeEnd("1");

// await fs.writeFile("./test/wPhoto.jpeg", (await wPhoto.getBufferAsync(jimp.AUTO)));
await fs.writeFile("./test/wPhoto.jpeg", wPhoto);

const res = await fetch("https://google.com");
console.log(res.status);
