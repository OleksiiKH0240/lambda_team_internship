import inquirer from 'inquirer';
import fs from 'node:fs/promises';

const nameQuestion = {
    name: 'name',
    message: 'What is username? (hit ENTER to exit)',
    type: 'input',
    default: ''
}

const questions = [
    {
        name: 'sex',
        message: 'What is your sex?',
        type: 'list',
        choices: ['male', 'female']
    },
    {
        name: 'age',
        message: 'What is your age in years?',
        type: 'input',
        validate: (answer) => {
            if (!Number.isInteger(answer) && answer <= 0) {
                return 'value must be a number';
            }
            return true;
        }
    },
];

const user = { "name": "", "sex": "", "age": NaN };


function askNameQuestion() {
    inquirer.prompt(nameQuestion).then((answer) => {
        if (answer.name != "") {
            user.name = answer.name.toLowerCase();
            askOtherQuestions();
        } else {
            inquirer.prompt({
                name: "searchConfirm",
                message: "Do you want to search user through the DB?",
                type: "confirm",
                default: true
            }).then((answer) => {
                if (answer.searchConfirm) {
                    inquirer.prompt(
                        {
                            name: 'username',
                            message: 'What is username?',
                            type: 'input'
                        }).then(answer => {
                            searchInDB(answer.username).then((value => {
                                console.log("Possible users:")
                                console.log(value);
                            }));
                        })
                }
            })
        }
    })
}

function askOtherQuestions() {
    inquirer.prompt(questions)
        .then((answers) => {
            user.sex = answers.sex;
            user.age = answers.age;
            // console.log("user was added: " + user)
            writeUserIntoFile(JSON.stringify(user));
            askNameQuestion();
        });
}


function writeUserIntoFile(userStr) {
    userStr += "\n";
    fs.writeFile('users.txt', userStr, { flag: 'a+' }, err => {
        if (err) {
            console.log(err);
            return;
        }
        console.log("User was successfully added at the end of the 'users.txt' file!");
    })
}

async function readUsersFromFile() {
    let users = [], userStrs;

    const file = await fs.open('./users.txt');
    const data = await file.readFile("utf8");
    userStrs = data.split("\n");

    userStrs = userStrs.filter(value => value != "");
    for (const user of userStrs) {
        // console.log(user)
        users.push(JSON.parse(user));
    }
    // users.map(userStr => { JSON.parse(userStr) });
    return users;
}

async function searchInDB(name) {
    let users = await readUsersFromFile(), suitableUsers = [];
    console.log("All users:");
    console.log(users);
    suitableUsers = users.filter(value => value.name == name || value.name.search(name) >= 0);
    // console.log(suitableUsers);
    return suitableUsers;
}

// console.log(await readUsersFromFile());

// console.log(a);
// console.log(readUsersFromFile());

askNameQuestion();
// console.log(await searchInDB("alex"));
