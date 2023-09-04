import fs from 'node:fs/promises';

async function readUsersFromFile() {
    let users, userStrs;
    // console.log("1");
    // let data = await fs.readFile('users.txt', 'utf-8');
    // console.log("2" + data);
    // userStrs = data.split("\n");

    // users = userStrs.filter(value => value != "");
    // users.map(userStr => { JSON.parse(userStr) });
    // return users;
    // return await fs.readFile('users.txt', 'utf-8');

    const file = await fs.open('./users.txt');
    let data = await file.readFile("utf8");
    // console.log("2" + data);
    userStrs = data.split("\n");

    users = userStrs.filter(value => value != "");
    users.map(userStr => { JSON.parse(userStr) });
    return users;   
}

console.log(await readUsersFromFile());
// console.log("2")