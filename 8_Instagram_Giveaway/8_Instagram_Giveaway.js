import fs from 'fs';
import path from 'path';

let dirName;
// dirName = "200k_words_100x100";
dirName = "2kk_words_400x400";

function uniqueValues() {
    const fileNames = fs.readdirSync(dirName), wordsSet = new Set();
    let data;
    for (let fileName of fileNames) {
        data = fs.readFileSync(path.join(dirName, fileName), "utf8");
        for (let word of data.split("\n")) {
            wordsSet.add(word);
        }
    }
    return wordsSet.size;
}

console.time("uniqueValues_time");
const uniqueValuesVal = uniqueValues();
console.timeEnd("uniqueValues_time");
console.log(`uniqueValues: ${uniqueValuesVal}`);


function intersectSets(set1, set2) {
    return new Set([...set1].filter(value => set2.has(value)));
}

function existInAllFiles() {
    const fileNames = fs.readdirSync(dirName), fileSets = {};
    let data;
    data = fs.readFileSync(path.join(dirName, fileNames[0]), "utf8")
    let intersectionSet = new Set(data.split("\n"));

    for (let fileName of fileNames.slice(1)) {
        data = fs.readFileSync(path.join(dirName, fileName), "utf8");
        intersectionSet = intersectSets(intersectionSet, new Set(data.split("\n")));
    }
    return intersectionSet.size;
}

console.time("existInAllFiles_time");
const existInAllFilesVal = existInAllFiles();
console.timeEnd("existInAllFiles_time");
console.log(`existInAllFiles: ${existInAllFilesVal}`);


function existInAtLeastTen() {
    const fileNames = fs.readdirSync(dirName), wordsSet = new Set(), filesSets = {};
    let data, words;
    for (let fileName of fileNames) {
        data = fs.readFileSync(path.join(dirName, fileName), "utf8");
        words = data.split("\n");
        filesSets[fileName] = new Set(words);
        for (let word of filesSets[fileName]) {
            wordsSet.add(word);
        }
    }
    const resultWords = [...wordsSet].filter((word) => {
        let count = 0;
        for (let fileName of fileNames) {
            count = filesSets[fileName].has(word) ? count + 1 : count;
        }
        return count >= 10;
    })
    return resultWords.length;
}

console.time("existInAtLeastTen_time");
const existInAtLeastTenVal = existInAtLeastTen();
console.timeEnd("existInAtLeastTen_time");
console.log(`existInAtLeastTen: ${existInAtLeastTenVal}`);

